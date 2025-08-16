"use client"

import { createContext, useContext, type ReactNode, useState, useEffect } from "react"

type Program = {
  id: number
  name: string
  routineId: number[]
  createdAt: string
  updatedAt: string
}

type Routine = {
  id: number
  blockId: number[]
  name: string
  createdAt: string
  updatedAt: string
}

type Block = {
  id: number
  exerciceId: number[]
  exerciseNotes: string[]
  name: string
  instructions: string
  focus: string
  createdAt: string
  updatedAt: string
}

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

type DataContextType = {
  programs: Program[]
  routines: Routine[]
  blocks: Block[]
  exercises: Exercise[]
  loading: boolean
  error: string | null
  fetchProgramDetails: (id: number) => Promise<Program | null>
  fetchRoutineDetails: (id: number) => Promise<Routine | null>
  fetchBlockDetails: (id: number) => Promise<Block | null>
  fetchExerciseDetails: (id: number) => Promise<Exercise | null>
  fetchRoutinesByProgram: (programId: number) => Promise<Routine[]>
  fetchBlocksByRoutine: (routineId: number) => Promise<Block[]>
  fetchExercisesByBlock: (blockId: number) => Promise<Exercise[]>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)

        // Fetch programs
        const programsResponse = await fetch("/api/programs")
        if (!programsResponse.ok) {
          throw new Error("Failed to fetch programs")
        }
        const programsData = await programsResponse.json()
        setPrograms(programsData || [])

        // Fetch routines
        const routinesResponse = await fetch("/api/routines")
        if (!routinesResponse.ok) {
          throw new Error("Failed to fetch routines")
        }
        const routinesData = await routinesResponse.json()
        setRoutines(routinesData || [])

        // Fetch blocks
        const blocksResponse = await fetch("/api/blocs")
        if (!blocksResponse.ok) {
          throw new Error("Failed to fetch blocks")
        }
        const blocksData = await blocksResponse.json()
        setBlocks(blocksData || [])

        // Fetch exercises
        const exercisesResponse = await fetch("/api/exercises")
        if (!exercisesResponse.ok) {
          throw new Error("Failed to fetch exercises")
        }
        const exercisesData = await exercisesResponse.json()
        setExercises(exercisesData || [])

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Error fetching initial data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  const fetchProgramDetails = async (id: number): Promise<Program | null> => {
    try {
      const response = await fetch(`/api/programs/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch program details")
      }
      return await response.json()
    } catch (err) {
      console.error("Error fetching program details:", err)
      return null
    }
  }

  const fetchRoutineDetails = async (id: number): Promise<Routine | null> => {
    try {
      const response = await fetch(`/api/routines/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch routine details")
      }
      return await response.json()
    } catch (err) {
      console.error("Error fetching routine details:", err)
      return null
    }
  }

  const fetchBlockDetails = async (id: number): Promise<Block | null> => {
    try {
      const response = await fetch(`/api/blocs/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch block details")
      }
      return await response.json()
    } catch (err) {
      console.error("Error fetching block details:", err)
      return null
    }
  }

  const fetchExerciseDetails = async (id: number): Promise<Exercise | null> => {
    try {
      const response = await fetch(`/api/exercises/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch exercise details")
      }
      return await response.json()
    } catch (err) {
      console.error("Error fetching exercise details:", err)
      return null
    }
  }

  const fetchRoutinesByProgram = async (programId: number): Promise<Routine[]> => {
    try {
      const program = programs.find(p => p.id === programId)
      if (!program) return []

      const routinesResponse = await fetch(`/api/routines`)
      if (!routinesResponse.ok) {
        throw new Error("Failed to fetch routines")
      }
      const allRoutines = await routinesResponse.json()
      return allRoutines.filter((r: Routine) => program.routineId.includes(r.id))
    } catch (err) {
      console.error("Error fetching routines by program:", err)
      return []
    }
  }

  const fetchBlocksByRoutine = async (routineId: number): Promise<Block[]> => {
    try {
      const routine = routines.find(r => r.id === routineId)
      if (!routine) return []

      const blocksResponse = await fetch(`/api/blocs`)
      if (!blocksResponse.ok) {
        throw new Error("Failed to fetch blocks")
      }
      const allBlocks = await blocksResponse.json()
      return allBlocks.filter((b: Block) => routine.blockId.includes(b.id))
    } catch (err) {
      console.error("Error fetching blocks by routine:", err)
      return []
    }
  }

  const fetchExercisesByBlock = async (blockId: number): Promise<Exercise[]> => {
    try {
      const block = blocks.find(b => b.id === blockId)
      if (!block) return []

      const exercisesResponse = await fetch(`/api/exercises`)
      if (!exercisesResponse.ok) {
        throw new Error("Failed to fetch exercises")
      }
      const allExercises = await exercisesResponse.json()
      return allExercises.filter((e: Exercise) => block.exerciceId.includes(e.id))
    } catch (err) {
      console.error("Error fetching exercises by block:", err)
      return []
    }
  }

  const value = {
    programs,
    routines,
    blocks,
    exercises,
    loading,
    error,
    fetchProgramDetails,
    fetchRoutineDetails,
    fetchBlockDetails,
    fetchExerciseDetails,
    fetchRoutinesByProgram,
    fetchBlocksByRoutine,
    fetchExercisesByBlock
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
