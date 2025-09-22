import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      organizationId: string;
      organization: {
        id: string;
        name: string;
        planType: string;
        phoneNumber?: string;
      };
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string;
    organization: {
      id: string;
      name: string;
      planType: string;
      phoneNumber?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    organizationId: string;
    organization: {
      id: string;
      name: string;
      planType: string;
      phoneNumber?: string;
    };
  }
}
