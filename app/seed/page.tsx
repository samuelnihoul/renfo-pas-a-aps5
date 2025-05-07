"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, Database, Loader2 } from "lucide-react"

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const handleSeed = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/seed")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Une erreur s'est produite lors de l'initialisation de la base de données.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-4 pl-0">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Button>
      </Link>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Initialisation de la base de données
          </CardTitle>
          <CardDescription>
            Remplir la base de données avec des exercices, programmes et jours d'entraînement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Cette action va initialiser la base de données avec des données de test. Si des données existent déjà, elles
            ne seront pas modifiées.
          </p>

          {result && (
            <div
              className={`p-3 rounded-md text-sm mb-4 ${
                result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {result.message || result.error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSeed} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Initialisation en cours...
              </>
            ) : result?.success ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Réinitialiser
              </>
            ) : (
              "Initialiser la base de données"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
