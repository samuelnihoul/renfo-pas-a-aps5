"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronRight, ChevronDown, Dumbbell, ListChecks, Calendar, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useData } from "@/components/data-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminLink } from "@/components/admin-link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";

// ======================
// TYPE DEFINITIONS
// ======================
// Define the shape of our data models to ensure type safety throughout the application
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
  equipment?: string | null
  sessionOutcome?: string | null
  createdAt: string
  updatedAt: string
}

type Program = {
  id: number
  name: string
  instructions?: string
  routineId: number[]
  createdAt: string
  updatedAt: string
}

// ======================
// EXERCISE COMPONENT
// ======================
// Displays individual exercise details including name, instructions, and objectives
function ExerciseItem({ exercise }: { exercise: Exercise }) {
  return (
    <div className="ml-2 sm:ml-4 p-1 sm:p-2 border-l-2 border-gray-200 pl-2 sm:pl-4">
      <div className="flex items-center gap-1 sm:gap-2">
        <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
        <span className="font-medium text-sm sm:text-base">{exercise.name}</span>
      </div>
      {exercise.instructions && (
        <p className="text-xs sm:text-sm text-gray-600 mt-1">{exercise.instructions}</p>
      )}
      {exercise.objectifs && (
        <p className="text-xs sm:text-sm text-gray-600 mt-1">{exercise.objectifs}</p>
      )}
    </div>
  )
}

// ======================
// BLOCK COMPONENT
// ======================
// Displays a collapsible block containing multiple exercises
// Handles expansion/collapse state and renders child exercises
function BlockItem({ block, exercises }: { block: Block, exercises: Exercise[] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const blockExercises = exercises.filter(ex => block.exerciceId.includes(ex.id))

  return (
    <div className="ml-2 sm:ml-4 border-l-2 border-gray-200 pl-2 sm:pl-4">
      <div
        className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-gray-50 p-1 sm:p-2 rounded"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ?
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> :
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
        }
        <ListChecks className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
        <span className="font-medium text-sm sm:text-base">{block.name}</span>
        {block.instructions && (
          <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2 truncate">{block.instructions}</span>
        )}
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

// ======================
// ROUTINE COMPONENT
// ======================
// Displays a collapsible routine section containing multiple blocks
// Shows equipment requirements and session outcomes if available
function RoutineItem({ routine, blocks, exercises }: { routine: Routine, blocks: Block[], exercises: Exercise[] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const routineBlocks = blocks.filter(block => routine.blockId.includes(block.id))

  return (
    <div className="ml-2 sm:ml-4 border-l-2 border-blue-200 pl-2 sm:pl-4">
      <div
        className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-blue-50 p-1 sm:p-2 rounded"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ?
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> :
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
        }
        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
        <span className="font-medium text-sm sm:text-base">{routine.name}</span>
      </div>

      {isExpanded && (
        <div className="space-y-2 sm:space-y-3 mt-1 sm:mt-2">
          {(routine as any).equipment && (
            <div className="bg-blue-50 p-2 sm:p-3 rounded-md text-xs sm:text-sm">
              <h4 className="font-medium text-blue-700 mb-1">Matériel nécessaire :</h4>
              <p className="text-blue-600">{(routine as any).equipment}</p>
            </div>
          )}

          {(routine as any).sessionOutcome && (
            <div className="bg-green-50 p-2 sm:p-3 rounded-md text-xs sm:text-sm">
              <h4 className="font-medium text-green-700 mb-1">Sortie de séance :</h4>
              <p className="text-green-600">{(routine as any).sessionOutcome}</p>
            </div>
          )}

          <div className="space-y-1 sm:space-y-2">
            {routineBlocks.map((block: any) => (
              <BlockItem
                key={block.id}
                block={block}
                exercises={exercises.filter(ex => block.exerciceId.includes(ex.id))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ======================
// MAIN PAGE COMPONENT
// ======================
// The home page that displays programs, routines, blocks, and exercises in a hierarchical view
export default function Home() {
  // State management for expanded programs and their routines
  const [expandedPrograms, setExpandedPrograms] = useState<Record<number, boolean>>({})
  const [programRoutines, setProgramRoutines] = useState<Record<number, Routine[]>>({})

  // UI state for video view and loading indicators
  const [loadingStates, setLoadingStates] = useState({
    programs: true,
    routines: true,
    blocks: true,
    exercises: true
  })

  // Error alert handled in a Suspense-wrapped child component

  // Data fetching and state management from context
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

  // ======================
  // SIDE EFFECTS
  // ======================
  // Load initial data when component mounts or dependencies change
  useEffect(() => {
    /**
   * Fetches and caches routines for all programs
   * Updates loading states and error handling
   */
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

  /**
   * Toggles the expanded/collapsed state of a program
   * @param programId - The ID of the program to toggle
   */
  const toggleProgram = (programId: number) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }))
  }

  return (
    <div className="container px-2 sm:px-4 py-4 sm:py-6 mx-auto">
      {/* Display error message if redirected due to unauthorized access */}
      <Suspense fallback={null}>
        <ErrorAlert />
      </Suspense>

      <Tabs defaultValue="programs" className="w-full overflow-x-hidden">
        <TabsList className="w-full flex">
          <TabsTrigger value="programs" className="flex-1 text-sm sm:text-base">Programmes</TabsTrigger>
          <TabsTrigger value="exercises" className="flex-1 text-sm sm:text-base">Exercices</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="mt-4">
          <div className="space-y-3 sm:space-y-4 px-1">
            {programs.map((program) => {
              const isLoading = !programRoutines[program.id]

              return (
                <Card key={program.id} className="overflow-hidden">
                  <div
                    className="p-3 sm:p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
                    onClick={() => toggleProgram(program.id)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      {expandedPrograms[program.id] ?
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" /> :
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                      }
                      <h2 className="text-base sm:text-xl font-semibold truncate">{program.name}</h2>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap ml-2">
                      {programRoutines[program.id]?.length || 0} routines
                    </div>
                  </div>

                  {expandedPrograms[program.id] && (
                    <div className="p-3 sm:p-4 pt-1 sm:pt-2">
                      <div className="space-y-8">
                        {programRoutines[program.id]?.flatMap(routine =>
                          blocks
                            .filter(block => routine.blockId.includes(block.id))
                            .flatMap(block => {
                              const blockExercises = exercises
                                .filter(ex => block.exerciceId.includes(ex.id))
                                .filter(ex => ex.videoPublicId);

                              if (blockExercises.length === 0) return null;

                              return (
                                <div key={`${routine.id}-${block.id}`} className="space-y-4 border-b pb-6 last:border-b-0 last:pb-0">
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <h3 className="font-semibold text-blue-800">{block.name}</h3>
                                    {block.instructions && (
                                      <p className="text-sm text-blue-700 mt-1">{block.instructions}</p>
                                    )}
                                    {block.focus && (
                                      <div className="mt-2">
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                          {block.focus}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {blockExercises.map((exercise, index) => (
                                      <div
                                        key={`${block.id}-${exercise.id}-${index}`}
                                        className="bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow transition-shadow"
                                      >
                                        <div className="aspect-video bg-black">
                                          <video
                                            src={typeof exercise.videoPublicId === 'string' ? exercise.videoPublicId : ''}
                                            controls
                                            className="w-full h-full object-cover"
                                            preload="metadata"
                                          />
                                        </div>
                                        <div className="p-3">
                                          <h4 className="font-medium text-sm sm:text-base">{exercise.name}</h4>
                                          {exercise.instructions && (
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                              {exercise.instructions}
                                            </p>
                                          )}
                                          {exercise.objectifs && (
                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                              <p className="text-xs font-medium text-gray-500">Objectifs:</p>
                                              <p className="text-xs text-gray-600">{exercise.objectifs}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })
                            .filter(Boolean)
                        )}
                      </div>
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

function ErrorAlert() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  if (errorParam !== 'unauthorized') return null

  return (
    <Alert className="mb-6" variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Accès non autorisé. Vous devez être administrateur pour accéder à cette section.
      </AlertDescription>
    </Alert>
  )
}
