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

type Routine = {
  id: number
  programId: number
  dayNumber: number
  name: string
  focus: string | null
  createdAt: string
  program?: {
    name: string
  }
}

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [routineToDelete, setRoutineToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchRoutines = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/routines")
      if (response.ok) {
        const data = await response.json()
        setRoutines(data)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors du chargement des routines")
      }
    } catch (error) {
      console.error("Error fetching routines:", error)
      setError("Erreur lors du chargement des routines")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutines()
  }, [])

  const confirmDeleteRoutine = (id: number) => {
    setRoutineToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteRoutine = async () => {
    if (!routineToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/routines/${routineToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Routine supprimée",
          description: "La routine a été supprimée avec succès",
        })
        // Mettre à jour la liste des routines
        setRoutines((prev) => prev.filter((routine) => routine.id !== routineToDelete))
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.error || "Erreur lors de la suppression de la routine",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting routine:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la routine",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setRoutineToDelete(null)
    }
  }

  const columns: ColumnDef<Routine>[] = [
    {
      accessorKey: "name",
      header: "Nom",
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const routine = row.original

        return (
          <div className="flex items-center gap-2">
            <Link href={`/admin/routines/${routine.id}`}>
              <Button variant="ghost" size="icon" title="Modifier">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              title="Supprimer"
              onClick={() => confirmDeleteRoutine(routine.id)}
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
        <span className="ml-2">Chargement des routines...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={fetchRoutines}>
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Routines</h1>
        <Link href="/admin/routines/nouveau">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle routine
          </Button>
        </Link>
      </div>

      {routines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">Aucune routine n'a été créée pour le moment.</p>
            <Link href="/admin/routines/nouveau">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer une routine
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={columns} data={routines} searchKey="name" searchPlaceholder="Rechercher une routine..." />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette routine ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La routine et tous ses exercices seront définitivement
              supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoutine}
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