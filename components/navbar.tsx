"use client"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function Navbar() {
    const { user, isAuthenticated, loading, signOut } = useAuth()

    // Define navigation links as an array of objects
    const navItems = [
        { href: "/programmes", label: "Boutique des Programmes" },
        { href: "/", label: "Mes Programmes" },
        { href: "/mediatheque", label: "Médiathèque d'exercices" },
    ]

    // Define auth links as an object
    const authItems = {
        authenticated: (
            <>
                <span className="text-sm font-medium max-w-[120px] truncate" title={user?.name || user?.email}>
                    {user?.name || user?.email}
                </span>
                <SheetClose asChild>
                    <Button size="sm" variant="outline" onClick={signOut} className="w-full md:w-auto">
                        Se déconnecter
                    </Button>
                </SheetClose>
            </>
        ),
        unauthenticated: (
            <>
                <SheetClose asChild>
                    <Button asChild size="sm" className="w-full md:w-auto">
                        <Link href="/auth/signin">Se connecter</Link>
                    </Button>
                </SheetClose>
                <SheetClose asChild>
                    <Button asChild size="sm" variant="outline" className="w-full md:w-auto">
                        <Link href="/auth/signup">S'inscrire</Link>
                    </Button>
                </SheetClose>
            </>
        ),
        loading: <Skeleton className="h-8 w-24 rounded" />,
    }

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
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className="hover:underline text-sm font-medium">
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop Auth-Status */}
                <div className="hidden md:flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium max-w-[120px] truncate" title={user?.name || user?.email}>
                                {user?.name || user?.email}
                            </span>
                            <Button size="sm" variant="outline" onClick={signOut}>
                                Se déconnecter
                            </Button>
                        </div>
                    ) : loading ? (
                        <Skeleton className="h-8 w-24 rounded" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button asChild size="sm">
                                <Link href="/auth/signin">Se connecter</Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                                <Link href="/auth/signup">S'inscrire</Link>
                            </Button>
                        </div>
                    )}
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
                                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                                <SheetClose asChild>
                                    <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
                                        <img src="/favicon.ico" alt="Logo" className="h-8 w-8" />
                                        Renfo Pas à Pas
                                    </Link>
                                </SheetClose>
                                <nav className="flex flex-col gap-2 border-b pb-4 mb-4">
                                    {navItems.map((item) => (
                                        <SheetClose asChild key={item.href}>
                                            <Link href={item.href} className="hover:underline text-sm font-medium w-full block py-2">
                                                {item.label}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </nav>
                                <div className="flex flex-col gap-2 mt-auto">
                                    {loading ? (
                                        authItems.loading
                                    ) : isAuthenticated ? (
                                        <div className="flex flex-col gap-2 w-full">
                                            {authItems.authenticated}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 w-full">
                                            {authItems.unauthenticated}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    )
}
