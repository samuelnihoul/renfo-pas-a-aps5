"use client"

import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { useData } from "@/components/data-provider"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProgrammePage({ params }: { params: { id: string } }) {
  const { fetchProgramDetails } = useData()
  const [program, setProgram] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProgram = async () => {
      try {
        setLoading(true)
        const programData = await fetchProgramDetails(Number.parseInt(params.id))
        if (programData) {
          setProgram(programData)
          setError(null)
        } else {
          setError("Programme non trouvé")
        }
      } catch (err) {
        setError("Erreur lors du chargement du programme")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProgram()
  }, [params.id, fetchProgramDetails])

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-screen">
        <p>Chargement du programme...</p>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-2 pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <p className="text-red-500">{error || "Programme non trouvé"}</p>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <header className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-2 pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold gradient-text">{program.name}</h1>
        <p className="text-muted-foreground">{program.description}</p>
      </header>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-medium">Difficulté:</span>
          <span className={program.difficulty === "Intermédiaire" ? "text-orange-500" : "text-green-500"}>
            {program.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Durée:</span>
          <span>{program.duration}</span>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Jours d'entraînement</h2>

      <div className="space-y-4">
        {program.days.map((day: any) => (
          <Link href={`/programmes/${params.id}/session/${day.id}`} key={day.id}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {day.name}
                </CardTitle>
                <CardDescription>{day.focus}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Exercices disponibles</p>
              </CardContent>
              <CardFooter className="pt-2 border-t">
                <Button variant="ghost" size="sm" className="ml-auto hover:text-theme-light">
                  Commencer
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
