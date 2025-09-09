import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Development endpoint to promote a user to admin
 * This should be removed or secured in production
 */
export async function POST(request: Request) {
    try {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: "Not available in production" }, { status: 403 })
        }

        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        // Find user by email
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Update user to admin
        const [updatedUser] = await db
            .update(users)
            .set({ isAdmin: true })
            .where(eq(users.email, email))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                isAdmin: users.isAdmin
            })

        return NextResponse.json({
            message: "User promoted to admin successfully",
            user: updatedUser
        })

    } catch (error) {
        console.error("Error promoting user to admin:", error)
        return NextResponse.json({ error: "Error promoting user to admin" }, { status: 500 })
    }
}
