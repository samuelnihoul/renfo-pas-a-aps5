"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Dumbbell, Calendar, FileVideo, LogOut,AlignJustify,FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Accueil",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Programmes",
    href: "/admin/programmes",
    icon: Calendar,
  },
  {
    title: "Exercices",
    href: "/admin/exercices",
    icon: Dumbbell,
  },
  {
    title: "Routines",
    href: "/admin/routines",
    icon: FileText,
  },
  {
    title: "Blocs",
    href: "/admin/blocs",
    icon: FileVideo,
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-r min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold gradient-text">Renfo Pas à Pas</h1>
        <p className="text-xs text-muted-foreground">Administration</p>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === item.href ? "bg-gradient-theme text-white" : "hover:bg-muted",
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t mt-8">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Retour au site
        </Link>
      </div>
    </aside>
  )
}
