"use client"

import Link from "next/link"
import { Settings } from "lucide-react"

export function Footer() {
    return (
        <footer className="w-full border-t bg-background/80 backdrop-blur mt-auto">
            <div className="container mx-auto flex items-center justify-between h-16 px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>© 2024 Renfo Pas à Pas</span>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Settings className="h-4 w-4" />
                        <span>Administration</span>
                    </Link>
                </div>
            </div>
        </footer>
    )
} 