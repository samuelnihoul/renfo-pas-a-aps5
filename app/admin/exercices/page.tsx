//admin/exercices/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Exercise } from "@/db/schema"



export default function ExercisesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Get page index from URL params
  const pageIndex = useMemo(() => {
    const page = searchParams.get('page')
    return page ? parseInt(page, 10) - 1 : 0
  }, [searchParams])

  const fetchExercises = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/exercises")
      if (response.ok) {
        const data = await response.json()
        setExercises(data)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors du chargement des exercices")
      }
    } catch (error) {
      console.error("Error fetching exercises:", error)
      setError("Erreur lors du chargement des exercices")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [])

  const confirmDeleteExercise = (id: number) => {
    setExerciseToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteExercise = async () => {
    if (!exerciseToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/exercises/${exerciseToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Exercice supprimé",
          description: "L'exercice a été supprimé avec succès",
        })
        // Mettre à jour la liste des exercices
        setExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseToDelete))
      } else {
        let errorMessage = "Erreur lors de la suppression de l'exercice"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
          errorMessage = `Erreur ${response.status}: ${response.statusText}`
        }
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting exercise:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'exercice",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setExerciseToDelete(null)
    }
  }

  const columns: ColumnDef<Exercise>[] = [
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
      accessorKey: "objectifs",
      header: "Objectifs",
    },
    {
      accessorKey: "muscleGroup",
      header: "Groupe musculaire",
    },
    {
      accessorKey: "instructions",
      header: "Instructions"
    },
    {
      accessorKey: "videoPublicId",
      header: "Vidéo",
      cell: ({ row }) => {
        const videoUrl = row.getValue("videoPublicId") as string | null
        return videoUrl ? "Oui" : "Non"
      },
    },
    {
      accessorKey: "short",
      header: "Short",
      cell: ({ row }) => {
        const shortUrl = row.getValue("short") as string | null
        return shortUrl ? "Oui" : "Non"
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const exercise = row.original
        const currentPage = searchParams.get('page') || '1'

        return (
          <div className="flex items-center gap-2">
            <Link href={`/admin/exercices/${exercise.id}?page=${currentPage}`}>
              <Button variant="ghost" size="icon" title="Modifier">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              title="Supprimer"
              onClick={() => confirmDeleteExercise(exercise.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const handlePageChange = (newPageIndex: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newPageIndex === 0) {
      params.delete('page')
    } else {
      params.set('page', String(newPageIndex + 1))
    }
    // Use replace to avoid adding to history and keep URL in sync
    router.replace(`/admin/exercices?${params.toString()}`, { scroll: false })
  }

  const filteredExercises = useMemo(() => {
    if (!searchTerm.trim()) return exercises;
    const term = searchTerm.toLowerCase();
    return exercises.filter(exercise => 
      exercise.name.toLowerCase().includes(term) ||
      (exercise.objectifs && exercise.objectifs.toLowerCase().includes(term)) ||
      (exercise.muscleGroup && exercise.muscleGroup.toLowerCase().includes(term))
    );
  }, [exercises, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Chargement des exercices...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={fetchExercises}>
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Exercices</h1>
          <Link href="/admin/exercices/nouveau">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel exercice
            </Button>
          </Link>
        </div>
      </div>

      {exercises.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">Aucun exercice n'a été créé pour le moment.</p>
            <Link href="/admin/exercices/nouveau">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer un exercice
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <DataTable 
          columns={columns} 
          data={exercises} 
          searchKey={["name", "objectifs", "muscleGroup"]}
          searchPlaceholder="Rechercher par nom, objectif ou groupe musculaire..."
          initialPageIndex={pageIndex}
          onPageChange={handlePageChange}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet exercice ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'exercice sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExercise}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
