"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent } from "@/components/ui/card"
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

type Block = {
  id: number
  name: string
  tempsReps:string
  category: string
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
        setError(errorData.error || "Erreur lors du chargement des blocks")
      }
    } catch (error) {
      console.error("Error fetching exercises:", error)
      setError("Erreur lors du chargement des blocks")
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
          description: "L'bloc a été supprimé avec succès",
        })
        // Mettre à jour la liste des blocks
        setExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseToDelete))
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.error || "Erreur lors de la suppression de l'bloc",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting exercise:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'bloc",
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
      accessorKey: "muscleGroup",
      header: "Groupe musculaire",
    },
    {
      accessorKey: "difficulty",
      header: "Difficulté",
      cell: ({ row }) => {
        const difficulty = row.getValue("difficulty") as string
        return (
          <div
            className={
              difficulty === "Intermédiaire"
                ? "text-orange-500"
                : difficulty === "Avancé"
                  ? "text-red-500"
                  : "text-green-500"
            }
          >
            {difficulty}
          </div>
        )
      },
    },
    {
      accessorKey: "videoUrl",
      header: "Vidéo",
      cell: ({ row }) => {
        const videoUrl = row.getValue("videoUrl") as string | null
        return videoUrl ? "Oui" : "Non"
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const exercise = row.original

        return (
          <div className="flex items-center gap-2">
            <Link href={`/admin/blocks/${exercise.id}`}>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Chargement des blocks...</span>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blocs</h1>
        <Link href="/admin/blocs/nouveau">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel bloc
          </Button>
        </Link>
      </div>

      {blocs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">Aucun bloc n'a été créé pour le moment</p>
            <Link href="/admin/blocs/nouveau">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer un bloc
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={columns} data={exercises} searchKey="name" searchPlaceholder="Rechercher un bloc..." />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce bloc ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le bloc sera définitivement supprimé.
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
