"use client"

import Link from "next/link"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminLink() {
  return (
    <Link href="/admin" className="fixed bottom-4 right-4 z-50">
      <Button size="icon" variant="outline" className="rounded-full h-12 w-12 shadow-lg">
        <Settings className="h-5 w-5" />
      </Button>
    </Link>
  )
}
