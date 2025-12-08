"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"
import { useEffect, useState } from "react"
import { useData } from "@/components/data-provider"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CategoryPage({ params }: { params: { category: string } }) {
  const paramsUnwrapped = React.use(params as any) as { category: string }
  const category = paramsUnwrapped.category
  const { fetchExercisesByMuscleGroup } = useData()
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Capitaliser la première lettre de la catégorie
  const categoryName = decodeURIComponent(category.charAt(0).toUpperCase()) + decodeURIComponent(category.slice(1))

  useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoading(true)
        const exercisesData = await fetchExercisesByMuscleGroup(categoryName)
        setExercises(exercisesData)
        setError(null)
      } catch (err) {
        setError("Erreur lors du chargement des exercices")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadExercises()
  }, [categoryName, fetchExercisesByMuscleGroup])

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-screen">
        <p>Chargement des exercices...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-2 pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <header className="mb-6">
        <Link href="/mediatheque">
          <Button variant="ghost" size="sm" className="mb-2 pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold gradient-text">Exercices: {categoryName}</h1>
        <p className="text-muted-foreground">{exercises.length} exercices disponibles</p>
      </header>

      <div className="space-y-4">
        {exercises.map((exercise) => (
          <Link href={`/mediatheque/${category}/${exercise.id}`} key={exercise.id}>
            <Card>
              <div className="relative">
                {exercise.videoPublicId ? (
                  <div className="w-full h-48 relative">
                    <video
                      src={exercise.videoPublicId}
                      className="w-full h-full object-cover"
                      poster="/placeholder.svg"
                      muted
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        const video = e.target as HTMLVideoElement;
                        video.currentTime = 0.1;
                        video.onloadeddata = () => {
                          video.pause();
                        };
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-12 h-12 text-theme-light opacity-80" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 relative">
                    <img
                      src="/placeholder.svg"
                      alt={`Vidéo de ${exercise.name}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-12 h-12 text-theme-light opacity-80" />
                    </div>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle>{exercise.name}</CardTitle>
                <CardDescription>Niveau: {exercise.difficulty}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2 border-t">
                <Button variant="ghost" size="sm" className="ml-auto hover:text-theme-light">
                  Voir l'exercice
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
