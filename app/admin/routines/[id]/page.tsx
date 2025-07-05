"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import React from "react"
import ItemSelectorAndOrganizer from "@/components/admin/selector"
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
  name: string
  blockId: number[]
}

export default function EditRoutinePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const unwrappedParams = React.use(params as Promise<{ id: string }>)
  const id = unwrappedParams.id
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Routine>({
    id: Number(id),
    name: "",
    blockId: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchRoutine = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/routines/${id}`)
        if (response.ok) {
          const data = await response.json()
	  console.log('fetched data',data)
          setFormData(data)
	  console.log('form data after the fetch',formData)
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de charger les données de la routine",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching routine:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de la routine",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRoutine()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleBlockSelection = (selectedBlockIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      blockId: selectedBlockIds,
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = "Le nom de la routine est requis"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/routines/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Routine mise à jour",
          description: "La routine a été mise à jour avec succès",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.error || "Une erreur est survenue lors de la mise à jour de la routine",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating routine:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la routine",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/admin/routines/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Routine supprimée",
          description: "La routine a été supprimée avec succès",
        })
        router.push("/admin/routines")
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.error || "Une erreur est survenue lors de la suppression de la routine",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting routine:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la routine",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Chargement de la routine...</span>
        </div>
    )
  }

  return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/admin/routines">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </Link>
            <h1 className="text-2xl font-bold ml-2">Modifier la Routine</h1>
          </div>
          <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de la routine</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la routine</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name} 
                    onChange={handleInputChange}
                    className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <ItemSelectorAndOrganizer items={"blocs"} onItemSelectAction={handleBlockSelection} />

              <CardFooter className="px-0 pt-4">
                <Button type="submit" disabled={saving} className="ml-auto">
                  {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                  ) : (
                      "Enregistrer les modifications"
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

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
              <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
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
