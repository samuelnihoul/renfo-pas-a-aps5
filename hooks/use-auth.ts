"use client"
import { useState, useEffect } from "react"
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from "next-auth/react"

interface User {
    id: string
    email: string
    name: string
    image?: string
    isAdmin: boolean
    isPremium: boolean
}

export function useAuth() {
    const { data: session, status } = useSession()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "loading") return
        
        if (session?.user) {
            setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.name || '',
                image: session.user.image,
                isAdmin: (session.user as any).isAdmin || false,
                isPremium: (session.user as any).isPremium || false
            })
        } else {
            setUser(null)
        }
        setLoading(status === "loading")
    }, [session, status])

    const signIn = async (email: string, password: string) => {
        try {
            const result = await nextAuthSignIn('credentials', {
                redirect: false,
                email,
                password,
            })

            if (result?.error) {
                throw new Error(result.error)
            }

            // The session will be updated automatically by NextAuth
            return { success: true }
        } catch (error) {
            console.error("Sign in error:", error)
            return { success: false, error: error instanceof Error ? error.message : "Erreur de connexion" }
        }
    }

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Erreur lors de l'inscription")
            }

            // Automatically sign in after successful registration
            return await signIn(email, password)
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "Erreur lors de l'inscription" }
        }
    }

    const signOut = async () => {
        try {
            await nextAuthSignOut({ redirect: true })
document.cookie = `next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
            setUser(null)
            return { success: true }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "Erreur lors de la déconnexion" }
        }
    }

    return {
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
    }
} 
