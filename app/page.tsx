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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";

// Types pour les composants
type Exercise = {
  id: number
  name: string
  videoPublicId: string | null
  instructions: string | null
  objectifs: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

type Block = {
  id: number
  name: string
  instructions: string
  focus: string
  exerciceId: number[]
  exerciseNotes: string[]
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
        <span className="text-sm text-gray-500 ml-2">{block.instructions}</span>
      </div>

      {isExpanded && blockExercises.map((ex: any, idx: number) => (
        <div key={ex.id}>
          <ExerciseItem exercise={ex} />
          {block.exerciseNotes && block.exerciseNotes[idx] && (
            <div className="text-xs text-muted-foreground ml-8 mb-2">Note: {block.exerciseNotes[idx]}</div>
          )}
        </div>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="ml-4 flex-shrink-0 focus:outline-none group">
                              <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center relative">
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
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.06v7.882a1 1 0 001.234.97l6.518-1.857A1 1 0 0016 14.06V9.94a1 1 0 00-1.248-.772z" /></svg>
                                </div>
                              </div>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl w-full">
                            <DialogTitle>
                              <span className="sr-only">{exercise.name}</span>
                            </DialogTitle>
                            <div className="w-full aspect-video">
                              <video
                                src={typeof exercise.videoPublicId === 'string' ? exercise.videoPublicId : ''}
                                controls
                                autoPlay
                                className="w-full h-full object-contain rounded"
                                poster="/placeholder.svg"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
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
