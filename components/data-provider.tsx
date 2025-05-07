"use client"

import { createContext, useContext, type ReactNode, useState, useEffect } from "react"

type Program = {
  id: number
  name: string
  description: string | null
  difficulty: string
  duration: string | null
  days: ProgramDay[]
}

type ProgramDay = {
  id: number
  programId: number
  dayNumber: number
  name: string
  focus: string | null
}

type Exercise = {
  id: number
  name: string
  description: string | null
  muscleGroup: string
  difficulty: string
  videoUrl: string | null
  instructions: string | null
}

type DayExercise = {
  id: number
  dayId: number
  exerciseId: number
  sets: number
  reps: string
  restTime: string | null
  orderIndex: number
  exercise: Exercise
}

type DataContextType = {
  programs: Program[]
  exercises: Exercise[]
  loading: boolean
  error: string | null
  fetchProgramDetails: (id: number) => Promise<Program | null>
  fetchDayExercises: (programId: number, dayId: number) => Promise<DayExercise[]>
  fetchExercisesByMuscleGroup: (muscleGroup: string) => Promise<Exercise[]>
  fetchExerciseDetails: (id: number) => Promise<Exercise | null>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [programs, setPrograms] = useState<Program[]>([])
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
      const data = await response.json()

      // Vérifier si les données sont au format attendu
      if (!data || !data.id) {
        console.error("Invalid program data format:", data)
        return null
      }

      return data
    } catch (err) {
      console.error("Error fetching program details:", err)
      return null
    }
  }

  const fetchDayExercises = async (programId: number, dayId: number): Promise<DayExercise[]> => {
    try {
      const response = await fetch(`/api/programs/${programId}/days/${dayId}/exercises`)
      if (!response.ok) {
        throw new Error("Failed to fetch day exercises")
      }
      return await response.json()
    } catch (err) {
      console.error("Error fetching day exercises:", err)
      return []
    }
  }

  const fetchExercisesByMuscleGroup = async (muscleGroup: string): Promise<Exercise[]> => {
    try {
      const response = await fetch(`/api/exercises?muscleGroup=${encodeURIComponent(muscleGroup)}`)
      if (!response.ok) {
        throw new Error("Failed to fetch exercises by muscle group")
      }
      return await response.json()
    } catch (err) {
      console.error("Error fetching exercises by muscle group:", err)
      return []
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

  const value = {
    programs,
    exercises,
    loading,
    error,
    fetchProgramDetails,
    fetchDayExercises,
    fetchExercisesByMuscleGroup,
    fetchExerciseDetails,
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
