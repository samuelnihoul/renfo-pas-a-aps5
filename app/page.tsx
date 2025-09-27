"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronRight, ChevronDown, ChevronLeft, ChevronsLeft, ChevronsRight, Dumbbell, ListChecks, Calendar, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useData } from "@/components/data-provider"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
  description?: string
  routineId: number[]
  createdAt: string
  updatedAt: string
  [key: string]: any // Permet des propriétés supplémentaires comme 'instructions'
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
// ERROR ALERT COMPONENT
// ======================
// Displays error messages for unauthorized access or other errors
function ErrorAlert() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  if (!error) return null

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {error === 'AccessDenied' 
          ? 'Vous devez être connecté pour accéder à cette page.' 
          : 'Une erreur est survenue. Veuillez réessayer.'}
      </AlertDescription>
    </Alert>
  )
}

// ======================
// MAIN PAGE COMPONENT
// ======================
// The home page that displays programs, routines, blocks, and exercises in a hierarchical view
export default function Home() {
  // State management for expanded programs, their routines and pagination
  const [expandedPrograms, setExpandedPrograms] = useState<Record<number, boolean>>({})
  const [programRoutines, setProgramRoutines] = useState<Record<number, Routine[]>>({})
  const [currentRoutineIndices, setCurrentRoutineIndices] = useState<Record<number, number>>({})

  // UI state for video view and loading indicators
  const [loadingStates, setLoadingStates] = useState({
    programs: true,
    routines: true,
    blocks: true,
    exercises: true
  })


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
    
    // Initialize or reset the current routine index when expanding
    if (!expandedPrograms[programId]) {
      setCurrentRoutineIndices(prev => ({
        ...prev,
        [programId]: 0
      }))
    }
  }
  
  const goToRoutine = (programId: number, index: number) => {
    setCurrentRoutineIndices(prev => ({
      ...prev,
      [programId]: index
    }))
  }
  
  const goToNextRoutine = (programId: number) => {
    const currentIndex = currentRoutineIndices[programId] || 0
    const routines = programRoutines[programId] || []
    if (currentIndex < routines.length - 1) {
      goToRoutine(programId, currentIndex + 1)
    }
  }
  
  const goToPrevRoutine = (programId: number) => {
    const currentIndex = currentRoutineIndices[programId] || 0
    if (currentIndex > 0) {
      goToRoutine(programId, currentIndex - 1)
    }
  }

  return (
    <div className="container px-0 py-4 sm:py-6 mx-auto">
      {/* Display error message if redirected due to unauthorized access */}
      <Suspense fallback={null}>
        <ErrorAlert />
      </Suspense>

               <div className="space-y-6 px-1">
            {programs.map((program) => {
              const isLoading = !programRoutines[program.id]
              const programBlocks = blocks.filter(block => 
                programRoutines[program.id]?.some(routine => routine.blockId.includes(block.id))
              )

              return (
                <Card key={program.id} className="overflow-hidden">
                  <div
                    className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-colors"
                    onClick={() => toggleProgram(program.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedPrograms[program.id] ? (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        )}
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">{program.name}</h2>
                      </div>
                      <div className="text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full border">
                        {programRoutines[program.id]?.length || 0} routines
                      </div>
                    </div>
                    {program.description && (
                      <p className="text-sm text-gray-600 mt-2 ml-8">{program.description}</p>
                    )}
                  </div>

                  {expandedPrograms[program.id] && programRoutines[program.id]?.length > 0 && (
                    <div className="w-full">
                      <div className="mb-4">
                        <Card className="border shadow-sm">
                          {(() => {
                            const currentIndex = currentRoutineIndices[program.id] || 0
                            const routine = programRoutines[program.id][currentIndex]
                            const totalRoutines = programRoutines[program.id].length
                            
                            return (
                              <>
                                <CardHeader className="pb-3 border-b px-4 py-3">
                                  <CardTitle className="text-base sm:text-lg font-semibold">
                                    {routine.name} <span className="text-sm font-normal text-muted-foreground">({currentIndex + 1}/{totalRoutines})</span>
                                  </CardTitle>
                                  {routine.equipment && (
                                    <CardDescription className="text-sm">
                                      Matériel: {routine.equipment}
                                    </CardDescription>
                                  )}
                                  {routine.sessionOutcome && (
                                    <CardDescription className="text-sm mt-1">
                                      Objectif: {routine.sessionOutcome}
                                    </CardDescription>
                                  )}
                                </CardHeader>
                                <CardContent className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
                                  {blocks
                                    .filter(block => routine.blockId.includes(block.id))
                                    .map((block) => (
                                      <div key={block.id} className="space-y-3">
                                        <div className={`p-3 rounded-md ${
                                          block.name.includes('Activation') ? 'bg-blue-50 border border-blue-100' :
                                          block.name.includes('Mobilité') ? 'bg-green-50 border border-green-100' :
                                          block.name.includes('Développement') ? 'bg-orange-50 border border-orange-100' : 
                                          'bg-gray-50 border border-gray-100'
                                        }`}>
                                          <h3 className={`font-medium ${
                                            block.name.includes('Activation') ? 'text-blue-800' :
                                            block.name.includes('Mobilité') ? 'text-green-800' :
                                            block.name.includes('Développement') ? 'text-orange-800' : 'text-gray-800'
                                          }`}>
                                            {block.name}
                                          </h3>
                                          {block.instructions && (
                                            <p className="text-sm text-gray-600 mt-1">{block.instructions}</p>
                                          )}
                                        </div>
                                        
                                        <div className="space-y-2 ml-1">
                                          {exercises
                                            .filter(ex => block.exerciceId.includes(ex.id))
                                            .map((exercise, idx) => (
                                              <div 
                                                key={`${block.id}-${exercise.id}`}
                                                className="flex items-start p-2 rounded hover:bg-gray-50 transition-colors"
                                              >
                                                {exercise.videoPublicId ? (
                                                  <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden mr-3">
                                                    <video
                                                      src={exercise.videoPublicId}
                                                      className="w-full h-full object-cover"
                                                      muted
                                                      preload="metadata"
                                                    />
                                                  </div>
                                                ) : (
                                                  <div className="w-12 h-12 flex-shrink-0 mr-3 rounded bg-gray-100 flex items-center justify-center">
                                                    <Dumbbell className="w-4 h-4 text-gray-400" />
                                                  </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                  <h4 className="text-sm font-medium text-gray-900">{exercise.name}</h4>
                                                  {block.exerciseNotes?.[idx] && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                      {block.exerciseNotes[idx]}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    ))}
                                </CardContent>
                              </>
                            )
                          })()}
                        </Card>
                      </div>
                      
                      <Pagination className="mt-4">
                        <PaginationContent className="w-full flex justify-between">
                          <PaginationItem>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-1"
                              onClick={() => goToRoutine(program.id, 0)}
                              disabled={(currentRoutineIndices[program.id] || 0) === 0}
                            >
                              <ChevronsLeft className="h-4 w-4" />
                              <span className="sr-only sm:not-sr-only sm:ml-2">Première</span>
                            </Button>
                          </PaginationItem>
                          
                          <PaginationItem>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-9 w-9"
                                onClick={() => goToPrevRoutine(program.id)}
                                disabled={(currentRoutineIndices[program.id] || 0) === 0}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              
                              <div className="px-4 text-sm text-muted-foreground">
                                {((currentRoutineIndices[program.id] || 0) + 1)} / {programRoutines[program.id]?.length || 0}
                              </div>
                              
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-9 w-9"
                                onClick={() => goToNextRoutine(program.id)}
                                disabled={(currentRoutineIndices[program.id] || 0) >= (programRoutines[program.id]?.length || 1) - 1}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </PaginationItem>
                          
                          <PaginationItem>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-1"
                              onClick={() => {
                                const lastIndex = (programRoutines[program.id]?.length || 1) - 1
                                goToRoutine(program.id, lastIndex)
                              }}
                              disabled={(currentRoutineIndices[program.id] || 0) >= (programRoutines[program.id]?.length || 1) - 1}
                            >
                              <span className="sr-only sm:not-sr-only sm:mr-2">Dernière</span>
                              <ChevronsRight className="h-4 w-4" />
                            </Button>
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </Card>
              )
            })}

            {programs.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                <p className="text-gray-500">Aucun programme disponible pour le moment.</p>
              </div>
            )}
          </div>

          </div>
  )
}

