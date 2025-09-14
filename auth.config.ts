import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [], // We'll add providers in the route handler
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
    error: '/auth/error',   // Error page
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || '';
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isPremium = token.isPremium as boolean;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin || false;
        token.isPremium = (user as any).isPremium || false;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt', // Use JWT for session management
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;
