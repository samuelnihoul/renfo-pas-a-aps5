import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DataProvider } from "@/components/data-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MuscuFit - Application de renforcement musculaire",
  description: "Application de programme de renforcement musculaire avec médiathèque d'exercices",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <DataProvider>{children}</DataProvider>
        <Toaster />
      </body>
    </html>
  )
}
