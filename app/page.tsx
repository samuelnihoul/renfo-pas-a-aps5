"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, ChevronDown, Dumbbell, ListChecks, Calendar } from "lucide-react"
import Image from "next/image"
import { useData } from "@/components/data-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminLink } from "@/components/admin-link"

// Types pour les composants
type Exercise = {
  id: number
  name: string
  videoPublicId: string | null
  instructions: string | null
  objectifs: string | null
  createdAt: string
  updatedAt: string
}

type Block = {
  id: number
  name: string
  sets: string
  restTime: string | null
  focus: string
  exerciceId: number[]
  createdAt: string
  updatedAt: string
}

type Routine = {
  id: number
  name: string
  blockId: number[]
  createdAt: string
  updatedAt: string
}

type Program = {
  id: number
  name: string
  material: string
  routineId: number[]
  createdAt: string
  updatedAt: string
}

// Composant pour afficher un exercice
function ExerciseItem({ exercise }: { exercise: Exercise }) {
  return (
    <div className="ml-8 p-2 border-l-2 border-gray-200 pl-4">
      <div className="flex items-center gap-2">
        <Dumbbell className="w-4 h-4 text-gray-500" />
        <span className="font-medium">{exercise.name}</span>
      </div>
      {exercise.instructions && (
        <p className="text-sm text-gray-600 mt-1">{exercise.instructions}</p>
      )}
      {exercise.objectifs && (
        <p className="text-sm text-gray-600 mt-1">{exercise.objectifs}</p>
      )}
    </div>
  )
}

// Composant pour afficher un bloc d'exercices
function BlockItem({ block, exercises }: { block: Block, exercises: Exercise[] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const blockExercises = exercises.filter(ex => block.exerciceId.includes(ex.id))

  return (
    <div className="ml-6 border-l-2 border-gray-200 pl-4">
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ?
          <ChevronDown className="w-4 h-4" /> :
          <ChevronRight className="w-4 h-4" />
        }
        <ListChecks className="w-4 h-4 text-blue-500" />
        <span className="font-medium">{block.name}</span>
        <span className="text-sm text-gray-500 ml-2">({block.sets})</span>
      </div>

      {isExpanded && blockExercises.map((ex: any) => (
        <ExerciseItem key={ex.id} exercise={ex} />
      ))}
    </div>
  )
}

// Composant pour afficher une routine
function RoutineItem({ routine, blocks, exercises }: { routine: Routine, blocks: Block[], exercises: Exercise[] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const routineBlocks = blocks.filter(block => routine.blockId.includes(block.id))

  return (
    <div className="ml-4 border-l-2 border-blue-200 pl-4">
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ?
          <ChevronDown className="w-4 h-4" /> :
          <ChevronRight className="w-4 h-4" />
        }
        <Calendar className="w-4 h-4 text-blue-500" />
        <span className="font-medium">{routine.name}</span>
      </div>

      {isExpanded && routineBlocks.map((block: any) => (
        <BlockItem
          key={block.id}
          block={block}
          exercises={exercises.filter(ex => block.exerciceId.includes(ex.id))}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const {
    programs,
    routines,
    blocks,
    exercises,
    loading,
    error,
    fetchRoutinesByProgram,
    fetchBlocksByRoutine,
    fetchExercisesByBlock
  } = useData()

  const [expandedPrograms, setExpandedPrograms] = useState<Record<number, boolean>>({})
  const [programRoutines, setProgramRoutines] = useState<Record<number, Routine[]>>({})
  const [videoView, setVideoView] = useState(false)
  const [loadingStates, setLoadingStates] = useState({
    programs: true,
    routines: true,
    blocks: true,
    exercises: true
  })

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Charger les routines pour chaque programme
        if (programs.length > 0) {
          setLoadingStates(prev => ({ ...prev, routines: true }))
          const routinesMap: Record<number, Routine[]> = {}

          await Promise.all(programs.map(async (program) => {
            const programRoutines = await fetchRoutinesByProgram(program.id)
            routinesMap[program.id] = programRoutines
          }))

          setProgramRoutines(routinesMap)
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
      } finally {
        setLoadingStates(prev => ({ ...prev, routines: false }))
      }
    }

    loadInitialData()
  }, [programs, fetchRoutinesByProgram])

  // Afficher un indicateur de chargement global si nécessaire
  if (loading || loadingStates.routines) {
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

  const toggleProgram = (programId: number) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }))
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Renfo Pas à Pas</h1>
            <p className="text-sm text-muted-foreground">Renforcement pour la course à pied</p>
          </div>

        </div>
        <div className="w-8 h-8 relative">
          <Image
            src="/favicon.ico"
            alt="Company Logo"
            fill
            className="object-contain rounded-xl"
            priority
          />
        </div>
      </header>

      <Tabs defaultValue="programs" className="w-full overflow-x-hidden">
        <TabsList>
          <TabsTrigger value="programs">Programmes</TabsTrigger>
          <TabsTrigger value="exercises">Médiathèque d'exercices</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="mt-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Vue normale</span>
            <button
              onClick={() => setVideoView(!videoView)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${videoView ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${videoView ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <span className="text-sm text-muted-foreground">Vue vidéo</span>
          </div>
          <div className="space-y-6">
            {programs.map((program) => {
              const isLoading = !programRoutines[program.id]

              return (
                <Card key={program.id} className="overflow-hidden">
                  <div
                    className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
                    onClick={() => toggleProgram(program.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedPrograms[program.id] ?
                        <ChevronDown className="w-5 h-5 text-gray-500" /> :
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      }
                      <h2 className="text-xl font-semibold">{program.name}</h2>
                    </div>
                    <div className="text-sm text-gray-500">
                      {programRoutines[program.id]?.length || 0} routines
                    </div>
                  </div>

                  {expandedPrograms[program.id] && (
                    <div className="p-4 pt-2">
                      {!videoView ? (
                        <>
                          <div className="mb-4">
                            <h3 className="font-medium text-gray-700 mb-2">Matériel nécessaire :</h3>
                            <p className="text-gray-600">{program.material || "Aucun matériel spécifié"}</p>
                          </div>

                          <div>
                            <h3 className="font-medium text-gray-700 mb-2">Routines :</h3>
                            <div className="space-y-4">
                              {isLoading ? (
                                <div className="flex justify-center py-4">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                </div>
                              ) : programRoutines[program.id]?.length > 0 ? (
                                programRoutines[program.id].map(routine => {
                                  const routineBlocks = blocks.filter(b => routine.blockId.includes(b.id))
                                  return (
                                    <RoutineItem
                                      key={routine.id}
                                      routine={routine}
                                      blocks={routineBlocks}
                                      exercises={exercises}
                                    />
                                  )
                                })
                              ) : (
                                <p className="text-gray-500 text-sm">Aucune routine disponible pour ce programme.</p>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-6">
                          {programRoutines[program.id]?.flatMap(routine =>
                            blocks
                              .filter(block => routine.blockId.includes(block.id))
                              .flatMap(block =>
                                exercises
                                  .filter(ex => block.exerciceId.includes(ex.id))
                                  .filter(ex => ex.videoPublicId)
                                  .map(exercise => (
                                    <div key={`${routine.id}-${block.id}-${exercise.id}`} className="space-y-2">
                                      <h4 className="font-medium">{exercise.name}</h4>
                                      <div className="aspect-w-16 aspect-h-9">
                                        <video
                                          src={typeof exercise.videoPublicId === 'string' ? exercise.videoPublicId : ''}
                                          controls
                                          className="w-full rounded-lg"
                                          preload="metadata"
                                        />
                                      </div>
                                    </div>
                                  ))
                              )
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}

            {programs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun programme disponible pour le moment.</p>
                <Button className="mt-4" asChild>
                  <Link href="/admin/programmes/nouveau">Créer un programme</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="exercises" className="mt-6">
          <div className="space-y-8 w-full overflow-x-hidden">
            {exercises.length > 0 ? (
              exercises.map((exercise) => (
                <Card key={exercise.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{exercise.name}</h3>
                        {exercise.objectifs && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Objectifs :</span> {exercise.objectifs}
                          </p>
                        )}
                      </div>

                      {exercise.videoPublicId && (
                        <div className="ml-4 flex-shrink-0">
                          <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                            <video
                              src={typeof exercise.videoPublicId === 'string' ? exercise.videoPublicId : ''}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                              poster="/placeholder.svg"
                              onLoadedMetadata={(e) => {
                                const video = e.target as HTMLVideoElement;
                                video.currentTime = 0.1;
                                video.onloadeddata = () => {
                                  video.pause();
                                };
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {exercise.instructions && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700">Instructions :</h4>
                        <p className="text-sm text-gray-600 mt-1">{exercise.instructions}</p>
                      </div>
                    )}
                    {exercise.objectifs && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700">Objectifs :</h4>
                        <p className="text-sm text-gray-600 mt-1">{exercise.objectifs}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun exercice disponible pour le moment.</p>
                <Button className="mt-4" asChild>
                  <Link href="/admin/exercices/nouveau">Ajouter un exercice</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
