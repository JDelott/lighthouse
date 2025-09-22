import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { pool } from './database';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const client = await pool.connect();
        try {
          const userResult = await client.query(
            `SELECT u.*, o.name as org_name, o.plan_type, o.phone_number as org_phone 
             FROM users u 
             LEFT JOIN organizations o ON u.organization_id = o.id 
             WHERE u.email = $1`,
            [credentials.email]
          );

          const user = userResult.rows[0];
          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organization_id,
            organization: {
              id: user.organization_id,
              name: user.org_name,
              planType: user.plan_type,
              phoneNumber: user.org_phone
            },
          };
        } finally {
          client.release();
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.organization = user.organization;
      }
      
      // Handle Google OAuth
      if (account?.provider === 'google' && user) {
        const client = await pool.connect();
        try {
          // Check if user exists
          const existingUser = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [user.email]
          );

          if (existingUser.rows.length === 0) {
            // Create new user and organization for Google sign-up
            const orgId = `org-${Date.now()}`;
            await client.query('BEGIN');
            
            await client.query(
              `INSERT INTO organizations (id, name, plan_type, created_at, updated_at) 
               VALUES ($1, $2, $3, NOW(), NOW())`,
              [orgId, `${user.name}'s Practice`, 'trial']
            );

            const userId = `user-${Date.now()}`;
            await client.query(
              `INSERT INTO users (id, email, name, role, organization_id, is_active, created_at, updated_at) 
               VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
              [userId, user.email, user.name, 'admin', orgId, true]
            );

            await client.query('COMMIT');

            token.role = 'admin';
            token.organizationId = orgId;
            token.organization = {
              id: orgId,
              name: `${user.name}'s Practice`,
              planType: 'trial'
            };
          }
        } catch (error) {
          await client.query('ROLLBACK');
          console.error('Error creating user from Google OAuth:', error);
        } finally {
          client.release();
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.organization = token.organization as any;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
};
