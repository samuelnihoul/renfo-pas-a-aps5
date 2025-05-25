"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import React from "react"
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
}

type Routine = {
  id: number
  programId: number
  dayNumber: number
  name: string
  focus: string | null
}

export default function EditRoutinePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const unwrappedParams = React.use(params as Promise<{ id: string }>)
  const id = unwrappedParams.id
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [programs, setPrograms] = useState<Program[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(true)
  const [formData, setFormData] = useState<Routine>({
    id: Number(id),
    programId: 0,
    dayNumber: 0,
    name: "",
    focus: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch routine data
  useEffect(() => {
    const fetchRoutine = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/routines/${id}`)
        if (response.ok) {
          const data = await response.json()
          setFormData(data)
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

  // Fetch available programs
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoadingPrograms(true)
      try {
        const response = await fetch("/api/programs")
        if (response.ok) {
          const data = await response.json()
          setPrograms(data)
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de charger les programmes",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching programs:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les programmes",
          variant: "destructive",
        })
      } finally {
        setLoadingPrograms(false)
      }
    }

    fetchPrograms()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: name === "programId" ? Number(value) : value }))
    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.programId) {
      newErrors.programId = "Veuillez sélectionner un programme"
    }

    if (!formData.dayNumber) {
      newErrors.dayNumber = "Veuillez entrer un numéro de jour"
    } else if (formData.dayNumber < 1) {
      newErrors.dayNumber = "Le numéro de jour doit être un nombre positif"
    }

    if (!formData.name.trim()) {
      newErrors.name = "Veuillez entrer un nom pour la routine"
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
              <Label htmlFor="programId">Programme</Label>
              <Select
                value={formData.programId.toString()}
                onValueChange={(value) => handleSelectChange("programId", value)}
                disabled={loadingPrograms}
              >
                <SelectTrigger id="programId" className={errors.programId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner un programme" />
                </SelectTrigger>
                <SelectContent>
                  {loadingPrograms ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Chargement...
                    </div>
                  ) : programs.length === 0 ? (
                    <div className="p-2 text-center text-muted-foreground">
                      Aucun programme disponible
                    </div>
                  ) : (
                    programs.map((program) => (
                      <SelectItem key={program.id} value={program.id.toString()}>
                        {program.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.programId && <p className="text-sm text-destructive">{errors.programId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dayNumber">Numéro du jour</Label>
              <Input
                id="dayNumber"
                name="dayNumber"
                type="number"
                min="1"
                value={formData.dayNumber}
                onChange={(e) => handleInputChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: "dayNumber",
                    value: e.target.value,
                  },
                } as React.ChangeEvent<HTMLInputElement>)}
                className={errors.dayNumber ? "border-destructive" : ""}
              />
              {errors.dayNumber && <p className="text-sm text-destructive">{errors.dayNumber}</p>}
            </div>

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
              <Label htmlFor="focus">Focus (optionnel)</Label>
              <Input
                id="focus"
                name="focus"
                value={formData.focus || ""}
                onChange={handleInputChange}
                placeholder="ex: Haut du corps, Jambes, etc."
              />
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