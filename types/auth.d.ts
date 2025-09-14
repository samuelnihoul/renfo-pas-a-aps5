import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
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

  interface User extends DefaultUser {
    id: string
    email: string
    name?: string | null
    image?: string | null
    isAdmin?: boolean
    isPremium?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name?: string | null
    isAdmin: boolean
    isPremium: boolean
  }
}
