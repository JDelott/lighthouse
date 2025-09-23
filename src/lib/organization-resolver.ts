import { pool } from './database';

/**
 * Resolves which organization a webhook call belongs to based on various identifiers
 */
export class OrganizationResolver {
  
  /**
   * Get organization ID by Vapi assistant ID
   */
  static async getByAssistantId(assistantId: string): Promise<string | null> {
    if (!assistantId) return null;
    
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT id FROM organizations WHERE vapi_assistant_id = $1 AND is_active = true',
          [assistantId]
        );
        
        const orgId = result.rows[0]?.id || null;
        console.log(`🔍 Assistant ${assistantId} → Organization ${orgId}`);
        return orgId;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error resolving organization by assistant ID:', error);
      return null;
    }
  }

  /**
   * Get organization ID by Vapi phone number
   */
  static async getByPhoneNumber(phoneNumber: string): Promise<string | null> {
    if (!phoneNumber) return null;
    
    try {
      const client = await pool.connect();
      try {
        // Try exact match first
        let result = await client.query(
          'SELECT id FROM organizations WHERE vapi_phone_number = $1 AND is_active = true',
          [phoneNumber]
        );
        
        // If no exact match, try normalized phone number (remove +1, spaces, etc.)
        if (result.rows.length === 0) {
          const normalizedPhone = phoneNumber.replace(/[^\d]/g, '').replace(/^1/, '');
          result = await client.query(
            'SELECT id FROM organizations WHERE REPLACE(REPLACE(vapi_phone_number, \'+1\', \'\'), \'-\', \'\') LIKE $1 AND is_active = true',
            [`%${normalizedPhone}`]
          );
        }
        
        const orgId = result.rows[0]?.id || null;
        console.log(`📞 Phone ${phoneNumber} → Organization ${orgId}`);
        return orgId;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error resolving organization by phone number:', error);
      return null;
    }
  }

  /**
   * Get organization ID from webhook URL parameters
   */
  static getFromUrlParams(request: Request): string | null {
    try {
      const url = new URL(request.url);
      const orgId = url.searchParams.get('org');
      
      if (orgId) {
        console.log(`🔗 URL parameter → Organization ${orgId}`);
      }
      
      return orgId;
    } catch (error) {
      console.error('❌ Error parsing URL parameters:', error);
      return null;
    }
  }

  /**
   * Get the default/fallback organization (first active org)
   */
  static async getDefaultOrganization(): Promise<string | null> {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT id FROM organizations WHERE is_active = true ORDER BY created_at ASC LIMIT 1'
        );
        
        const orgId = result.rows[0]?.id || null;
        console.log(`🏢 Using default organization: ${orgId}`);
        return orgId;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error getting default organization:', error);
      return null;
    }
  }

  /**
   * Resolve organization using multiple strategies (priority order)
   */
  static async resolve(options: {
    assistantId?: string;
    phoneNumber?: string;
    request?: Request;
    fallbackToDefault?: boolean;
  }): Promise<string | null> {
    const { assistantId, phoneNumber, request, fallbackToDefault = true } = options;

    console.log('🔍 Resolving organization with:', {
      assistantId,
      phoneNumber,
      hasRequest: !!request,
      fallbackToDefault
    });

    // Strategy 1: URL parameters (highest priority for testing)
    if (request) {
      const urlOrgId = this.getFromUrlParams(request);
      if (urlOrgId) return urlOrgId;
    }

    // Strategy 2: Assistant ID (primary method for production)
    if (assistantId) {
      const assistantOrgId = await this.getByAssistantId(assistantId);
      if (assistantOrgId) return assistantOrgId;
    }

    // Strategy 3: Phone number (backup method)
    if (phoneNumber) {
      const phoneOrgId = await this.getByPhoneNumber(phoneNumber);
      if (phoneOrgId) return phoneOrgId;
    }

    // Strategy 4: Environment variable (current hardcoded method)
    if (process.env.VAPI_ORG_ID) {
      console.log(`⚙️ Using environment VAPI_ORG_ID: ${process.env.VAPI_ORG_ID}`);
      return process.env.VAPI_ORG_ID;
    }

    // Strategy 5: Default organization (fallback)
    if (fallbackToDefault) {
      return await this.getDefaultOrganization();
    }

    console.log('❌ Could not resolve organization');
    return null;
  }

  /**
   * Update organization's Vapi configuration
   */
  static async updateVapiConfig(organizationId: string, config: {
    assistantId?: string;
    phoneNumber?: string;
  }): Promise<boolean> {
    try {
      const client = await pool.connect();
      try {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (config.assistantId) {
          updates.push(`vapi_assistant_id = $${paramIndex++}`);
          values.push(config.assistantId);
        }

        if (config.phoneNumber) {
          updates.push(`vapi_phone_number = $${paramIndex++}`);
          values.push(config.phoneNumber);
        }

        if (updates.length === 0) return false;

        updates.push(`updated_at = NOW()`);
        values.push(organizationId);

        const query = `
          UPDATE organizations 
          SET ${updates.join(', ')} 
          WHERE id = $${paramIndex}
        `;

        const result = await client.query(query, values);
        
        console.log(`✅ Updated Vapi config for organization ${organizationId}`);
        return result.rowCount > 0;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error updating organization Vapi config:', error);
      return false;
    }
  }
}
