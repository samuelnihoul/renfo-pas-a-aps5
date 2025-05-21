import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { DataProvider } from "@/components/data-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Renfo Pas à Pas - Application de renforcement musculaire",
  description: "Application de programme de renforcement musculaire avec médiathèque d'exercices",
  generator: 'nihoul-hochedez.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Navbar />
        <DataProvider>{children}</DataProvider>
        <Toaster />
      </body>
    </html>
  )
}
