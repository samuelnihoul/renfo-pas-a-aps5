"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  equipment?: string | null
  instructions?: string | null
  sessionOutcome?: string | null
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
    equipment: "",
    instructions: "",
    sessionOutcome: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchRoutine = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/routines/${id}`)
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched routine data:', data)
          
          // Handle both array and single object responses
          const routineData = Array.isArray(data) ? data[0] : data
          
          // Normalize blockId to ensure it's an array
          const blockId = Array.isArray(routineData.blockId) ? 
            routineData.blockId : 
            (routineData.blockId ? [routineData.blockId] : []);
          
          setFormData({
            id: Number(id),
            name: routineData.name || "",
            blockId,
            equipment: routineData.equipment || "",
            instructions: routineData.instructions || "",
            sessionOutcome: routineData.sessionOutcome || ""
          })
          
          console.log('Form data after fetch:', {
            ...routineData,
            blockId,
            equipment: routineData.equipment || "",
            sessionOutcome: routineData.sessionOutcome || ""
          })
        } else {
          const errorData = await response.json().catch(() => ({}))
          toast({
            title: "Erreur",
            description: errorData.error || "Impossible de charger les données de la routine",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching routine:", error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement des données",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRoutine()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    console.log('Selected block IDs:', selectedBlockIds)
    // Prevent resetting to empty if already set
    if (selectedBlockIds.length === 0 && (formData.blockId?.length ?? 0) > 0) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      blockId: Array.isArray(selectedBlockIds) ? selectedBlockIds : [],
    }))
    // Clear any previous block-related errors
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.blockId
      return newErrors
    })
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
    console.log('Form submission - current formData:', formData) // Debug log
    
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

            <div className="space-y-2">
              <Label htmlFor="equipment">Matériel nécessaire</Label>
              <Textarea
                id="equipment"
                name="equipment"
                value={formData.equipment || ""}
                onChange={handleInputChange}
                placeholder="Listez le matériel nécessaire pour cette routine..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={formData.instructions || ""}
                onChange={handleInputChange}
                placeholder="Ajoutez les instructions pour cette routine..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionOutcome">Sortie de séance</Label>
              <Textarea
                id="sessionOutcome"
                name="sessionOutcome"
                value={formData.sessionOutcome || ""}
                onChange={handleInputChange}
                placeholder="Décrivez les objectifs et résultats attendus de cette séance..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Blocs de la routine</Label>
              <ItemSelectorAndOrganizer 
                items="blocs" 
                onItemSelectAction={handleBlockSelection} 
                selectedItemIds={formData.blockId || []} 
              />
              {errors.blockId && (
                <p className="text-sm text-destructive">{errors.blockId}</p>
              )}
            </div>

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
