import { useState, useEffect } from "react"
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"
import { Session } from "next-auth"

interface AuthUser {
    id: string
    email: string
    name?: string | null
    image?: string | null
    isAdmin: boolean
    isPremium: boolean
}

type SessionUser = {
    id: string
    email: string
    name?: string | null
    image?: string | null
    isAdmin?: boolean
    isPremium?: boolean
}

export function useAuth() {
    const { data: session, status } = useSession()
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "loading") return
        
        if (session?.user) {
            const sessionUser = session.user as SessionUser
            setUser({
                id: sessionUser.id,
                email: sessionUser.email || '',
                name: sessionUser.name || null,
                image: sessionUser.image || null,
                isAdmin: sessionUser.isAdmin || false,
                isPremium: sessionUser.isPremium || false
            })
        } else {
            setUser(null)
        }
        setLoading(false)
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
            await nextAuthSignOut({ redirect: false })
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
