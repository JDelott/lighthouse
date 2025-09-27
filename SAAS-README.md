# The Mental Health Hub - SaaS Platform

## 🚀 SaaS Transformation Complete!

Your Mental Health Hub has been transformed into a full SaaS platform with user authentication, pricing tiers, and multi-tenant functionality.

## ✨ New Features Added

### 🔐 Authentication & User Management
- **NextAuth.js integration** with email/password and Google OAuth
- **Multi-tenant architecture** with organizations and users
- **Role-based access control** (admin, coordinator, provider, viewer)
- **Secure sign-up and sign-in pages**

### 💰 Pricing & Subscriptions
- **4 pricing tiers**: Trial (free), Starter ($79/mo), Professional ($199/mo), Enterprise ($499/mo)
- **Usage tracking** with call limits and overage billing
- **14-day free trial** for all new users
- **Stripe integration ready** for payment processing

### 🏢 Multi-Tenant Database
- **Organizations table** for practice management
- **Users table** with organization relationships  
- **Subscriptions table** for billing management
- **Usage tracking** for call limits and analytics
- **Updated call_sessions** with organization isolation

### 🎨 SaaS Landing Page
- **Professional pricing page** with feature comparisons
- **Updated homepage** with pricing preview and CTAs
- **Sign-up/sign-in flows** integrated throughout
- **Responsive design** optimized for conversions

## 🛠 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `env-template.txt` to `.env.local` and fill in your values:
```bash
cp env-template.txt .env.local
```

**Required variables:**
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD` - Your PostgreSQL credentials
- `VAPI_API_KEY`, `NEXT_PUBLIC_VAPI_PHONE_NUMBER` - Your existing Vapi configuration

**Optional variables:**
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - For Google OAuth sign-in
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` - For payment processing

### 3. Database is Already Set Up
The migration script has already created all necessary tables:
- ✅ `organizations` - Practice/company data
- ✅ `users` - User accounts with roles
- ✅ `subscriptions` - Billing and plan information  
- ✅ `usage_tracking` - Monthly usage limits
- ✅ `call_sessions` - Updated with organization isolation

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your SaaS platform!

## 🎯 Key Pages & Features

### Landing Page (`/`)
- Hero section with demo phone number
- Pricing preview with 3 tiers
- Professional design with clear CTAs

### Pricing Page (`/pricing`)
- Detailed plan comparison
- FAQ section
- Annual billing toggle (20% discount)

### Authentication
- Sign up: `/auth/signup`
- Sign in: `/auth/signin`
- Supports both email/password and Google OAuth

### Dashboard (`/dashboard`)
- Organization-specific call data
- Role-based access control
- Usage tracking and analytics

## 📊 Database Schema

### Organizations
```sql
- id (primary key)
- name (practice name)
- plan_type (trial, starter, professional, enterprise)
- phone_number, address, website
- vapi_assistant_id, vapi_phone_number
- settings (JSON)
- is_active, trial_ends_at
- created_at, updated_at
```

### Users
```sql
- id (primary key)
- email (unique)
- password (hashed)
- name, role
- organization_id (foreign key)
- is_active, last_login_at, email_verified_at
- created_at, updated_at
```

### Usage Tracking
```sql
- id (primary key)
- organization_id (foreign key)
- month_year (YYYY-MM format)
- calls_count, minutes_used, transcription_minutes
- created_at, updated_at
```

## 🔒 Security Features

- **Password hashing** with bcrypt
- **JWT-based sessions** via NextAuth.js
- **Organization isolation** - users only see their org's data
- **HIPAA compliance** maintained throughout
- **SQL injection protection** with parameterized queries

## 💳 Billing Integration (Ready for Stripe)

The platform is prepared for Stripe integration:
- Subscription management tables
- Usage tracking for billing
- Plan limits and overage calculations
- Webhook handling structure

## 🚀 Next Steps

### Immediate
1. **Configure environment variables** in `.env.local`
2. **Test the sign-up flow** and create your first organization
3. **Customize the pricing** and features for your market

### Optional Enhancements
1. **Add Stripe billing** for automated payments
2. **Create onboarding flow** for new users
3. **Add team management** features
4. **Implement usage alerts** and billing notifications
5. **Add admin panel** for managing all organizations

## 🎉 Demo Account

A demo account has been created for testing:
- **Email**: demo@mentalhealthhub.com
- **Organization**: Demo Practice
- **Plan**: Trial (14 days)

## 📞 Original Features Preserved

All your original Vapi integration features remain intact:
- AI appointment scheduling
- Call transcription and analysis
- HIPAA compliant storage
- Dashboard analytics
- Webhook processing

The system now supports multiple organizations using these features simultaneously!

---

**Congratulations! 🎊** Your single-practice tool is now a full SaaS platform ready to serve multiple mental health practices with secure, scalable AI-powered appointment scheduling.
