import { AuditLog } from './types';
import { createAuditHash, generateSecureId } from './encryption';
import { dummyAuditLogs } from './dummy-data';

/**
 * HIPAA-compliant audit logging system
 * Tracks all access and modifications to protected health information
 */

interface AuditLogInput {
  entityType: 'patient' | 'provider' | 'referral';
  entityId: string;
  action: 'create' | 'read' | 'update' | 'delete';
  userId: string;
  userEmail: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  reason?: string;
}

/**
 * Creates a new audit log entry
 * @param input - Audit log data
 * @returns Promise<AuditLog> - The created audit log entry
 */
export async function createAuditLog(input: AuditLogInput): Promise<AuditLog> {
  const auditLog: AuditLog = {
    id: `audit-${generateSecureId()}`,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    userId: input.userId,
    userEmail: input.userEmail,
    changes: input.changes,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    timestamp: new Date().toISOString()
  };

  // Create integrity hash
  const auditHash = createAuditHash(auditLog);
  
  // In a real application, store the hash separately for integrity verification
  console.log('Audit log created:', { ...auditLog, hash: auditHash });

  // Add to dummy data (in real app, save to secure audit database)
  dummyAuditLogs.push(auditLog);

  return auditLog;
}

/**
 * Logs patient data access (required by HIPAA)
 * @param patientId - Patient ID
 * @param userId - User accessing the data
 * @param userEmail - User email
 * @param purpose - Purpose of access
 * @param ipAddress - IP address
 * @param userAgent - User agent
 */
export async function logPatientAccess(
  patientId: string,
  userId: string,
  userEmail: string,
  purpose: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await createAuditLog({
    entityType: 'patient',
    entityId: patientId,
    action: 'read',
    userId,
    userEmail,
    ipAddress,
    userAgent,
    reason: purpose
  });
}

/**
 * Logs referral status changes
 * @param referralId - Referral ID
 * @param oldStatus - Previous status
 * @param newStatus - New status
 * @param userId - User making the change
 * @param userEmail - User email
 * @param ipAddress - IP address
 * @param userAgent - User agent
 */
export async function logReferralStatusChange(
  referralId: string,
  oldStatus: string,
  newStatus: string,
  userId: string,
  userEmail: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await createAuditLog({
    entityType: 'referral',
    entityId: referralId,
    action: 'update',
    userId,
    userEmail,
    changes: {
      status: { from: oldStatus, to: newStatus }
    },
    ipAddress,
    userAgent
  });
}

/**
 * Logs provider assignment
 * @param referralId - Referral ID
 * @param providerId - Provider ID
 * @param userId - User making the assignment
 * @param userEmail - User email
 * @param ipAddress - IP address
 * @param userAgent - User agent
 */
export async function logProviderAssignment(
  referralId: string,
  providerId: string,
  userId: string,
  userEmail: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await createAuditLog({
    entityType: 'referral',
    entityId: referralId,
    action: 'update',
    userId,
    userEmail,
    changes: {
      providerId: providerId
    },
    ipAddress,
    userAgent
  });
}

/**
 * Gets audit logs for a specific entity
 * @param entityType - Type of entity
 * @param entityId - Entity ID
 * @returns Promise<AuditLog[]> - Array of audit logs
 */
export async function getAuditLogs(
  entityType: AuditLog['entityType'],
  entityId: string
): Promise<AuditLog[]> {
  // Filter dummy data (in real app, query audit database)
  const logs = dummyAuditLogs.filter(
    log => log.entityType === entityType && log.entityId === entityId
  );

  // Sort by timestamp (newest first)
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Gets audit logs for a specific user
 * @param userId - User ID
 * @param startDate - Start date filter
 * @param endDate - End date filter
 * @returns Promise<AuditLog[]> - Array of audit logs
 */
export async function getUserAuditLogs(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<AuditLog[]> {
  let logs = dummyAuditLogs.filter(log => log.userId === userId);

  // Apply date filters
  if (startDate) {
    logs = logs.filter(log => new Date(log.timestamp) >= startDate);
  }
  if (endDate) {
    logs = logs.filter(log => new Date(log.timestamp) <= endDate);
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Generates audit report for compliance
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Audit report data
 */
export async function generateAuditReport(startDate: Date, endDate: Date) {
  const logs = dummyAuditLogs.filter(
    log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    }
  );

  const report = {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    summary: {
      totalEvents: logs.length,
      patientAccess: logs.filter(l => l.entityType === 'patient' && l.action === 'read').length,
      referralCreated: logs.filter(l => l.entityType === 'referral' && l.action === 'create').length,
      referralUpdated: logs.filter(l => l.entityType === 'referral' && l.action === 'update').length,
      uniqueUsers: new Set(logs.map(l => l.userId)).size
    },
    userActivity: logs.reduce((acc, log) => {
      if (!acc[log.userId]) {
        acc[log.userId] = {
          userEmail: log.userEmail,
          actions: 0,
          lastActivity: log.timestamp
        };
      }
      acc[log.userId].actions++;
      if (new Date(log.timestamp) > new Date(acc[log.userId].lastActivity)) {
        acc[log.userId].lastActivity = log.timestamp;
      }
      return acc;
    }, {} as Record<string, any>),
    entityActivity: {
      patients: logs.filter(l => l.entityType === 'patient').length,
      referrals: logs.filter(l => l.entityType === 'referral').length,
      providers: logs.filter(l => l.entityType === 'provider').length
    }
  };

  return report;
}

/**
 * Validates audit log integrity
 * @param auditLog - Audit log to validate
 * @param expectedHash - Expected hash value
 * @returns boolean - True if integrity is intact
 */
export function validateAuditLogIntegrity(auditLog: AuditLog, expectedHash: string): boolean {
  const calculatedHash = createAuditHash(auditLog);
  return calculatedHash === expectedHash;
}

/**
 * Exports audit logs for compliance reporting
 * @param startDate - Start date
 * @param endDate - End date
 * @param format - Export format ('json' | 'csv')
 * @returns Formatted audit data
 */
export async function exportAuditLogs(
  startDate: Date,
  endDate: Date,
  format: 'json' | 'csv' = 'json'
) {
  const logs = dummyAuditLogs.filter(
    log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    }
  );

  if (format === 'csv') {
    const headers = [
      'ID', 'Entity Type', 'Entity ID', 'Action', 'User ID', 'User Email',
      'IP Address', 'User Agent', 'Timestamp', 'Changes'
    ];
    
    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        log.id,
        log.entityType,
        log.entityId,
        log.action,
        log.userId,
        log.userEmail,
        log.ipAddress,
        `"${log.userAgent}"`,
        log.timestamp,
        log.changes ? `"${JSON.stringify(log.changes)}"` : ''
      ].join(','))
    ];
    
    return csvRows.join('\n');
  }

  return JSON.stringify(logs, null, 2);
}
