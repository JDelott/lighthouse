import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const client = await pool.connect();
    try {
      // Get all organizations
      const orgsResult = await client.query('SELECT id, name, plan_type FROM organizations ORDER BY created_at');
      
      // Get all calls (without filtering)
      const callsResult = await client.query(`
        SELECT id, call_id, organization_id, client_phone, status, created_at 
        FROM call_sessions 
        ORDER BY created_at DESC
      `);
      
      // Get user info if logged in
      let userInfo = null;
      if (session) {
        userInfo = {
          id: session.user.id,
          email: session.user.email,
          organizationId: session.user.organizationId,
          organizationName: session.user.organization?.name
        };
      }
      
      return NextResponse.json({
        success: true,
        debug: {
          session: !!session,
          userInfo,
          organizations: orgsResult.rows,
          allCalls: callsResult.rows,
          callsCount: callsResult.rows.length
        }
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
