"use client"

import React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Info, Play } from "lucide-react"
import { useData } from "@/components/data-provider"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ExercisePage({ params }: { params: { category: string; id: string } }) {
  const awaitedParams = React.use(params as any) as { category: string; id: string }
  const id = awaitedParams.id
  const category = awaitedParams.category
  const { fetchExerciseDetails } = useData()
  const [exercise, setExercise] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const loadExercise = async () => {
      try {
        setLoading(true)
        const exerciseData = await fetchExerciseDetails(Number.parseInt(id))
        if (exerciseData) {
          setExercise(exerciseData)
          setError(null)
        } else {
          setError("Exercice non trouvé")
        }
      } catch (err) {
        setError("Erreur lors du chargement de l'exercice")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadExercise()
  }, [id, fetchExerciseDetails])

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-screen">
        <p>Chargement de l'exercice...</p>
      </div>
    )
  }

  if (error || !exercise) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <Link href={`/mediatheque/${category}`}>
          <Button variant="ghost" size="sm" className="mb-2 pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <p className="text-red-500">{error || "Exercice non trouvé"}</p>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <header className="mb-6">
        <Link href={`/mediatheque/${category}`}>
          <Button variant="ghost" size="sm" className="mb-2 pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold gradient-text">{exercise.name}</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Niveau:</span>
          <span>{exercise.difficulty}</span>
        </div>
      </header>

      <Card>
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gradient-bg text-white">
            <TabsTrigger value="video">
              <Play className="w-4 h-4 mr-2" />
              Vidéo
            </TabsTrigger>
            <TabsTrigger value="info">
              <Info className="w-4 h-4 mr-2" />
              Détails
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="p-0">
            <div className="aspect-video bg-muted flex items-center justify-center relative">
              {exercise.videoPublicId ? (
                <video
                  src={exercise.videoPublicId}
                  controls
                  preload="metadata"
                  className="w-full h-full object-cover"
                  poster="/placeholder.svg"
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement;
                    // Accéder à la première frame
                    video.currentTime = 0.1;
                    // Désactiver cette action après la première exécution
                    video.onloadeddata = () => {
                      video.pause();
                      // Réinitialiser pour la lecture normale
                      video.currentTime = 0;
                    };
                  }}
                />
              ) : (
                <>
                  <img
                    src="/placeholder.svg"
                    alt={`Vidéo de ${exercise.name}`}
                    className="w-full h-full object-cover"
                  />
                  <Play className="absolute w-16 h-16 text-theme-light opacity-80" />
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="info" className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-sm">{exercise.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Technique</h3>
                <p className="text-sm">{exercise.instructions}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Muscles ciblés</h3>
                <p className="text-sm">{exercise.muscleGroup}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Conseils</h3>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>Échauffez-vous avant de commencer</li>
                  <li>Concentrez-vous sur la qualité plutôt que la quantité</li>
                  <li>Augmentez progressivement la charge</li>
                  <li>Hydratez-vous régulièrement</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
