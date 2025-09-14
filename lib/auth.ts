import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Credentials from "@auth/core/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/db"
import { users, accounts, sessions, verificationTokens } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { AuthConfig, DefaultSession, DefaultUser } from "@auth/core/types"

declare module "@auth/core/types" {
  interface User extends DefaultUser {
    id: string
    email: string
    name?: string | null
    image?: string | null
    isAdmin?: boolean
    isPremium?: boolean
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      isAdmin: boolean
      isPremium: boolean
    }
  }
}

// Using type assertion to bypass DrizzleAdapter type issues
const adapter = DrizzleAdapter(db as any, {
  usersTable: users as any,
  accountsTable: accounts as any,
  sessionsTable: sessions as any,
  verificationTokensTable: verificationTokens as any,
})

export const authConfig: AuthConfig = {
  adapter,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user: any = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string)
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          isAdmin: user.isAdmin || false,
          isPremium: user.isPremium || false
        } as const
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub || ''
        session.user.isAdmin = token.isAdmin as boolean
        session.user.isPremium = token.isPremium as boolean
      }
      return session
    },
    jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin || false
        token.isPremium = user.isPremium || false
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  trustHost: true
}

import NextAuth from "next-auth"

const auth = NextAuth(authConfig)

const { 
  handlers: { GET, POST }, 
  auth: authHandler, 
  signIn, 
  signOut 
} = auth

export { GET, POST, authHandler, signIn, signOut }