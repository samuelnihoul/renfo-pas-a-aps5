"use client"

import Link from "next/link"
import { Video, MonitorIcon as Running } from "lucide-react"
import { useData } from "@/components/data-provider"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminLink } from "@/components/admin-link"

export default function Home() {
  const { programs, exercises, loading, error } = useData()

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-screen">
        <p>Chargement des données...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-screen">
        <p className="text-red-500">Erreur: {error}</p>
      </div>
    )
  }

  // Regrouper les exercices par groupe musculaire de manière sécurisée
  const exercisesByMuscle = exercises.reduce(
    (acc, exercise) => {
      const group = exercise.muscleGroup || "Autre"
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(exercise)
      return acc
    },
    {} as Record<string, typeof exercises>,
  )

  const muscleGroups = Object.keys(exercisesByMuscle)

  return (
    <div className="container px-4 py-8 mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Renfo Pas à Pas</h1>
          <p className="text-sm text-muted-foreground">Renforcement pour la course à pied</p>
        </div>
        <Running className="w-8 h-8 text-theme-light" />
      </header>

      <Tabs defaultValue="programmes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 gradient-bg text-white">
          <TabsTrigger value="programmes">Programmes</TabsTrigger>
          <TabsTrigger value="mediatheque">Médiathèque</TabsTrigger>
        </TabsList>

        <TabsContent value="programmes" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Mes Programmes</h2>

          {programs && programs.length > 0 ? (
            programs.map((program) => (
              <Link href={`/programmes/${program.id}`} key={program.id} className="block">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>{program.name}</CardTitle>
                    <CardDescription>Programme d'entraînement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Difficulté:</span>
                      <span className={program.difficulty === "Intermédiaire" ? "text-orange-500" : "text-green-500"}>
                        {program.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="font-medium">Durée:</span>
                      <span>{program.duration}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t">
                    <Button variant="ghost" size="sm" className="ml-auto hover:text-theme-light">
                      Voir le programme
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground mb-4">Aucun programme disponible pour le moment.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mediatheque" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Médiathèque d'Exercices</h2>

          <div className="grid grid-cols-2 gap-4">
            {muscleGroups.map((category) => (
              <Link href={`/mediatheque/${category.toLowerCase()}`} key={category}>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{category}</CardTitle>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0">
                    <Video className="w-5 h-5 text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      {exercisesByMuscle[category].length} exercices
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <AdminLink />
    </div>
  )
}
