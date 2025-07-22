"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function Navbar() {
    const { user, isAuthenticated, loading, signOut } = useAuth()

    // Navigation links
    const navLinks = (
        <>
            <Link href="/programmes" className="hover:underline text-sm font-medium w-full block py-2 md:py-0">
                Boutique des Programmes
            </Link>
            <Link href="/" className="hover:underline text-sm font-medium w-full block py-2 md:py-0">
                Mes Programmes
            </Link>
        </>
    )

    // Auth links
    const authLinks = loading ? (
        <Skeleton className="h-8 w-24 rounded" />
    ) : isAuthenticated && user ? (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full">
            <span className="text-sm font-medium max-w-[120px] truncate" title={user.name || user.email}>
                {user.name || user.email}
            </span>
            <Button size="sm" variant="outline" onClick={signOut} className="w-full md:w-auto">
                Se déconnecter
            </Button>
        </div>
    ) : (
        <div className="flex flex-col md:flex-row gap-2 w-full">
            <Button asChild size="sm" className="w-full md:w-auto">
                <Link href="/auth/signin">Se connecter</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="w-full md:w-auto">
                <Link href="/auth/signup">S'inscrire</Link>
            </Button>
        </div>
    )

    return (
        <nav className="w-full border-b bg-background/80 backdrop-blur sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto flex items-center justify-between h-16 px-4">
                {/* Logo/Brand */}
                <Link href="/" className="flex items-center gap-2 font-bold text-lg min-w-0 mr-8">
                    <img src="/favicon.ico" alt="Logo" className="h-8 w-8" />
                    <span className="truncate">Renfo Pas à Pas</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex flex-1 items-center justify-center gap-12">
                    {navLinks}
                </div>

                {/* Desktop Auth-Status */}
                <div className="hidden md:flex items-center gap-4">
                    {authLinks}
                </div>

                {/* Mobile Hamburger */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-2">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Ouvrir le menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <div className="flex flex-col h-full p-6 gap-6">
                                <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
                                    <img src="/favicon.ico" alt="Logo" className="h-8 w-8" />
                                    Renfo Pas à Pas
                                </Link>
                                <nav className="flex flex-col gap-2 border-b pb-4 mb-4">
                                    {navLinks}
                                </nav>
                                <div className="flex flex-col gap-2 mt-auto">
                                    {authLinks}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    )
} 
