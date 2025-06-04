//app/admin/pogrammes/page
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

type Program = {
  id: number
  name: string
  requiredEquipment: string
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/programs")
      if (response.ok) {
        const data = await response.json()
        setPrograms(data)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors du chargement des programmes")
      }
    } catch (error) {
      console.error("Error fetching programs:", error)
      setError("Erreur lors du chargement des programmes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrograms()
  }, [])

  const confirmDeleteProgram = (id: number) => {
    setProgramToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteProgram = async () => {
    if (!programToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/programmes/${programToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Programme supprimé",
          description: "Le programme a été supprimé avec succès",
        })
        setPrograms((prev) => prev.filter((program) => program.id !== programToDelete))
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.error || "Erreur lors de la suppression du programme",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting program:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du programme",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setProgramToDelete(null)
    }
  }

  const columns: ColumnDef<Program>[] = [
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
      accessorKey: "requiredEquipment",
      header: "Matériel nécessaire",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const program = row.original

        return (
            <div className="flex items-center gap-2">
              <Link href={`/admin/programmes/${program.id}`}>
                <Button variant="ghost" size="icon" title="Modifier">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  title="Supprimer"
                  onClick={() => confirmDeleteProgram(program.id)}
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
          <span className="ml-2">Chargement des programmes...</span>
        </div>
    )
  }

  if (error) {
    return (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          <p>{error}</p>
          <Button variant="outline" className="mt-2" onClick={fetchPrograms}>
            Réessayer
          </Button>
        </div>
    )
  }

  return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Programmes</h1>
          <Link href="/admin/programmes/nouveau">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau programme
            </Button>
          </Link>
        </div>

        {programs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground mb-4">Aucun programme n'a été créé pour le moment.</p>
                <Link href="/admin/programmes/nouveau">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un programme
                  </Button>
                </Link>
              </CardContent>
            </Card>
        ) : (
            <DataTable columns={columns} data={programs} searchKey="name" searchPlaceholder="Rechercher un programme..." />
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce programme ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le programme et toutes ses routines seront définitivement supprimés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                  onClick={handleDeleteProgram}
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
