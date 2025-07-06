import NextAuth from "@auth/nextjs"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import CredentialsProvider from "@auth/core/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/db"
import { users, accounts, sessions, verificationTokens } from "@/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1)

                if (!user[0] || !user[0].passwordHash) {
                    return null
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user[0].passwordHash)

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user[0].id,
                    email: user[0].email,
                    name: user[0].name,
                    image: user[0].image,
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/auth/signin",
        signUp: "/auth/signup",
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.image = user.image
            }
            return token
        },
        async session({ session, token }: any) {
            if (token) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.name = token.name as string
                session.user.image = token.image as string
            }
            return session
        }
    }
}) 