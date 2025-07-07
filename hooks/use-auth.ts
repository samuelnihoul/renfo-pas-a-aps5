import { useState, useEffect } from "react"

interface User {
    userId: string
    email: string
    name: string
    isAdmin: boolean
    isPremium: boolean
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/auth/me")
                if (response.ok) {
                    const userData = await response.json()
                    setUser(userData.user)
                }
            } catch (error) {
                console.error("Auth check failed:", error)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    const signIn = async (email: string, password: string) => {
        try {
            const response = await fetch("/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Erreur de connexion")
            }

            const data = await response.json()
            setUser(data.user)
            return { success: true }
        } catch (error) {
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
                throw new Error(error.error || "Erreur d'inscription")
            }

            const data = await response.json()
            setUser(data.user)
            return { success: true }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "Erreur d'inscription" }
        }
    }

    const signOut = async () => {
        try {
            await fetch("/api/auth/signout", { method: "POST" })
            setUser(null)
        } catch (error) {
            console.error("Sign out failed:", error)
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