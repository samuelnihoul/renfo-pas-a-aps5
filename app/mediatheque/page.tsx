"use client"

import React from "react"
import Link from "next/link"
import { Dumbbell, ArrowRight, Search, AlertTriangle } from "lucide-react"
import { useData } from "@/components/data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search as SearchComponent } from "@/components/medialab/search"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSession } from "next-auth/react"
import { useHasPurchasedProgram } from "@/hooks/use-has-purchased-program"

export default function MediathequePage() {
  const { data: session } = useSession()
  const { hasPurchased, loading: loadingPurchase } = useHasPurchasedProgram(session?.user?.id || '')
  const { fetchAllExercises } = useData()
  const [muscleGroups, setMuscleGroups] = React.useState<{[key: string]: number}>({})
  const [loadingExercises, setLoadingExercises] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadMuscleGroups = async () => {
      try {
        setLoadingExercises(true)
        const exercises = await fetchAllExercises()
        
        // Group exercises by muscle group and count them
        const groups = exercises.reduce((acc: {[key: string]: number}, exercise) => {
          if (exercise.muscleGroup) {
            acc[exercise.muscleGroup] = (acc[exercise.muscleGroup] || 0) + 1
          }
          return acc
        }, {})
        
        setMuscleGroups(groups)
        setError(null)
      } catch (err) {
        setError("Erreur lors du chargement des groupes musculaires")
        console.error(err)
      } finally {
        setLoadingExercises(false)
      }
    }

    loadMuscleGroups()
  }, [fetchAllExercises])

  if (loadingPurchase || loadingExercises) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    )
  }

  // Si l'utilisateur n'a pas acheté de programme
  if (!hasPurchased) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <Alert variant="default" className="mb-8">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Accès limité</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              La médiathèque d'exercices est réservée aux utilisateurs ayant acheté un programme.
            </p>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/programs">
                Voir les programmes disponibles
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Médiathèque d'exercices</h1>
        <p className="text-muted-foreground mb-6">
          Parcourez les exercices par groupe musculaire ou effectuez une recherche
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchComponent />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(muscleGroups).map(([muscleGroup, count]) => (
          <Link href={`/mediatheque/${muscleGroup.toLowerCase()}`} key={muscleGroup}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">{muscleGroup}</CardTitle>
                <Dumbbell className="w-6 h-6 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {count} {count === 1 ? 'exercice' : 'exercices'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
