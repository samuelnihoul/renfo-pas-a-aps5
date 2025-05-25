"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

type Program = {
  id: number
  name: string
}

export default function NewRoutinePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [programs, setPrograms] = useState<Program[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(true)
  const [formData, setFormData] = useState({
    programId: "",
    dayNumber: "",
    name: "",
    focus: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    setFormData((prev) => ({ ...prev, [name]: value }))
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
    } else if (isNaN(Number(formData.dayNumber)) || Number(formData.dayNumber) < 1) {
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

    setLoading(true)

    try {
      const response = await fetch("/api/admin/routines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          programId: Number(formData.programId),
          dayNumber: Number(formData.dayNumber),
        }),
      })

      if (response.ok) {
        toast({
          title: "Routine créée",
          description: "La routine a été créée avec succès",
        })
        router.push("/admin/routines")
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.error || "Une erreur est survenue lors de la création de la routine",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating routine:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la routine",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin/routines">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-2">Nouvelle Routine</h1>
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
                value={formData.programId}
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
                onChange={handleInputChange}
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
                value={formData.focus}
                onChange={handleInputChange}
                placeholder="ex: Haut du corps, Jambes, etc."
              />
            </div>

            <CardFooter className="px-0 pt-4">
              <Button type="submit" disabled={loading} className="ml-auto">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer la routine"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}