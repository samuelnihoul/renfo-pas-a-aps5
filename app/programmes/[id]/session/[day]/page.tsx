"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronDown, ChevronUp, Info, Play } from "lucide-react"
import { useData } from "@/components/data-provider"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function SessionPage({ params }: { params: { id: string; day: string } }) {
  const id = params.id
  const day = params.day
  const { fetchDayExercises, fetchProgramDetails } = useData()
  const [currentExercise, setCurrentExercise] = useState(0)
  const [dayExercises, setDayExercises] = useState<any[]>([])
  const [programDay, setProgramDay] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Charger les détails du programme pour obtenir le jour
        const program = await fetchProgramDetails(Number.parseInt(id))
        if (!program) {
          setError("Programme non trouvé")
          return
        }

        const dayObj = program.days.find((d: any) => d.id === Number.parseInt(day))
        if (!dayObj) {
          setError("Jour d'entraînement non trouvé")
          return
        }

        setProgramDay(dayObj)

        // Charger les exercices du jour
        const exercises = await fetchDayExercises(Number.parseInt(id), Number.parseInt(day))
        if (exercises.length === 0) {
          setError("Aucun exercice trouvé pour ce jour")
          return
        }

        setDayExercises(exercises)
        setError(null)
      } catch (err) {
        setError("Erreur lors du chargement des données")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, day, fetchDayExercises, fetchProgramDetails])

  const handleExerciseChange = (index: number) => {
    setCurrentExercise(index)
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: index * 300, // Hauteur approximative de chaque carte
        behavior: "smooth",
      })
    }
  }

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-screen">
        <p>Chargement de la session...</p>
      </div>
    )
  }

  if (error || !programDay || dayExercises.length === 0) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <Link href={`/programmes/${id}`}>
          <Button variant="ghost" size="sm" className="mb-2 pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au programme
          </Button>
        </Link>
        <p className="text-red-500">{error || "Données non disponibles"}</p>
      </div>
    )
  }

  return (
    <div className="container px-0 py-4 mx-auto h-screen flex flex-col">
      <header className="px-4 mb-4">
        <Link href={`/programmes/${id}`}>
          <Button variant="ghost" size="sm" className="mb-2 pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au programme
          </Button>
        </Link>
        <h1 className="text-2xl font-bold gradient-text">{programDay.name}</h1>
        <p className="text-muted-foreground">{programDay.focus}</p>
      </header>

      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleExerciseChange(Math.max(0, currentExercise - 1))}
            disabled={currentExercise === 0}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleExerciseChange(Math.min(dayExercises.length - 1, currentExercise + 1))}
            disabled={currentExercise === dayExercises.length - 1}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm font-medium">
          Exercice {currentExercise + 1}/{dayExercises.length}
        </div>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 w-full">
        <div className="space-y-6 pb-6">
          {dayExercises.map((dayExercise, index) => {
            const exercise = dayExercise.exercise

            return (
              <div key={dayExercise.id} className="px-4">
                <Card className={index === currentExercise ? "gradient-border" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle>{exercise.name}</CardTitle>
                    <CardDescription>{exercise.muscleGroup}</CardDescription>
                  </CardHeader>

                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 gradient-bg text-white">
                      <TabsTrigger value="info">
                        <Info className="w-4 h-4 mr-2" />
                        Détails
                      </TabsTrigger>
                      <TabsTrigger value="video">
                        <Play className="w-4 h-4 mr-2" />
                        Vidéo
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="p-4 pt-6">
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground">Séries</div>
                          <div className="font-semibold">{dayExercise.sets}</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground">Répétitions</div>
                          <div className="font-semibold">{dayExercise.reps}</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground">Repos</div>
                          <div className="font-semibold">{dayExercise.restTime || "60 sec"}</div>
                        </div>
                      </div>
                      <p className="text-sm">{exercise.description}</p>
                    </TabsContent>

                    <TabsContent value="video" className="p-0">
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <img
                          src={exercise.videoUrl || "/placeholder.svg"}
                          alt={`Vidéo de ${exercise.name}`}
                          className="w-full h-full object-cover"
                        />
                        <Play className="absolute w-12 h-12 text-theme-light opacity-80" />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <CardFooter className="pt-2 border-t">
                    <Button
                      variant={index === currentExercise ? "default" : "ghost"}
                      className={index === currentExercise ? "gradient-bg" : "hover:text-theme-light"}
                      size="sm"
                      onClick={() => handleExerciseChange(index)}
                    >
                      {index === currentExercise ? "En cours" : "Voir l'exercice"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
