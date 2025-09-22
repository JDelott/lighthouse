import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  practiceName: z.string().min(1, 'Practice name is required'),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const client = await pool.connect();
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [validatedData.email]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create organization and user in a transaction
      await client.query('BEGIN');

      const orgId = `org-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Create organization with trial plan
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14-day trial

      await client.query(
        `INSERT INTO organizations (id, name, plan_type, phone_number, trial_ends_at, is_active, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [orgId, validatedData.practiceName, 'trial', validatedData.phone, trialEndsAt, true]
      );

      // Create user
      await client.query(
        `INSERT INTO users (id, email, password, name, role, organization_id, is_active, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [userId, validatedData.email, hashedPassword, validatedData.name, 'admin', orgId, true]
      );

      // Create initial usage tracking record
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      await client.query(
        `INSERT INTO usage_tracking (id, organization_id, month_year, calls_count, minutes_used, transcription_minutes, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [`usage-${orgId}-${currentMonth}`, orgId, currentMonth, 0, 0, 0]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: userId,
          email: validatedData.email,
          name: validatedData.name,
          organizationId: orgId,
        }
      });

    } catch (dbError) {
      await client.query('ROLLBACK');
      console.error('Database error during registration:', dbError);
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
