import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Debug endpoint to check current user's admin status
 * Remove this in production
 */
export async function GET() {
    try {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: "Not available in production" }, { status: 403 })
        }

        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({
                authenticated: false,
                message: "No active session found"
            })
        }

        // Get user from database
        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        })

        return NextResponse.json({
            authenticated: true,
            session: {
                email: session.user.email,
                name: session.user.name,
                isAdmin: session.user.isAdmin,
                isPremium: session.user.isPremium
            },
            database: user ? {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
                isPremium: user.isPremium
            } : null,
            message: user ? "User found in database" : "User not found in database"
        })

    } catch (error) {
        console.error("Error checking user status:", error)
        return NextResponse.json({ error: "Error checking user status" }, { status: 500 })
    }
}
