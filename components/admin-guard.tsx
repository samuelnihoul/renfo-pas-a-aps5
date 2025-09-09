"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface AdminGuardProps {
    children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // User not authenticated, redirect to signin
                router.push("/auth/signin?callbackUrl=" + encodeURIComponent(window.location.pathname))
                return
            }

            if (!user.isAdmin) {
                // User authenticated but not admin, redirect to home with error
                router.push("/?error=unauthorized")
                return
            }
        }
    }, [user, loading, router])

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Vérification des permissions...</span>
                </div>
            </div>
        )
    }

    // Show loading while redirecting
    if (!user || !user.isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Redirection...</span>
                </div>
            </div>
        )
    }

    // User is authenticated and is admin, render children
    return <>{children}</>
}
