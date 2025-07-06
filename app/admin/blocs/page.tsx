//admin/blocs/page
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
import { Block } from "@/db/schema"

export default function BlocsPage() {
  const [blocs, setBlocs] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blocToDelete, setBlocToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchBlocs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/blocs")
      if (response.ok) {
        const data = await response.json()
        setBlocs(data)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors du chargement des blocs")
      }
    } catch (error) {
      console.error("Error fetching blocs:", error)
      setError("Erreur lors du chargement des blocs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlocs()
  }, [])

  const confirmDeleteBloc = (id: number) => {
    setBlocToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteBloc = async () => {
    if (!blocToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/blocs/${blocToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Bloc supprimé",
          description: "Le bloc a été supprimé avec succès",
        })
        // Mettre à jour la liste des blocs
        setBlocs((prev) => prev.filter((bloc) => bloc.id !== blocToDelete))
      } else {
        let errorMessage = "Erreur lors de la suppression du bloc"
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
      console.error("Error deleting bloc:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du bloc",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setBlocToDelete(null)
    }
  }

  const columns: ColumnDef<Block>[] = [
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
      accessorKey: "restTime",
      header: "Temps de repos",
    },
    {
      accessorKey: "sets",
      header: "Sets",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const bloc = row.original

        return (
          <div className="flex items-center gap-2">
            <Link href={`/admin/blocs/${bloc.id}`}>
              <Button variant="ghost" size="icon" title="Modifier">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              title="Supprimer"
              onClick={() => confirmDeleteBloc(bloc.id)}
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
        <span className="ml-2">Chargement des blocs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={fetchBlocs}>
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
            Nouveau bloc
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
        <DataTable columns={columns} data={blocs} searchKey="name" searchPlaceholder="Rechercher un bloc..." />
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
              onClick={handleDeleteBloc}
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
