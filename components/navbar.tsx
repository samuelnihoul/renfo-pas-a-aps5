"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

export function Navbar() {
    const { user, isAuthenticated, loading, signOut } = useAuth()

    return (
        <nav className="w-full border-b bg-background/80 backdrop-blur sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between h-16 px-4">
                {/* Logo/Brand */}
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                    <img src="/placeholder-logo.svg" alt="Logo" className="h-8 w-8" />
                    Renfo Pas à Pas
                </Link>

                {/* Navigation */}
                <div className="flex items-center gap-4">
                    <Link href="/programmes" className="hover:underline text-sm font-medium">
                        Programmes
                    </Link>
                </div>

                {/* Auth-Status */}
                <div className="flex items-center gap-4">
                    {loading ? (
                        <Skeleton className="h-8 w-24 rounded" />
                    ) : isAuthenticated && user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium max-w-[120px] truncate" title={user.name || user.email}>
                                {user.name || user.email}
                            </span>
                            <Button size="sm" variant="outline" onClick={signOut}>
                                Se déconnecter
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Button asChild size="sm">
                                <Link href="/auth/signin">Se connecter</Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                                <Link href="/auth/signup">S'inscrire</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
} 