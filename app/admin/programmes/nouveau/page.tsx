//app/admin/programmes/nouveau/page
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import Selector from "@/components/admin/selector"

export default function NewProgram() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    requiredEquipment: "",
    routineIds: [] as number[],
    instructions: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleRoutineSelection = (selectedRoutineIds: number[]) => {
    console.log("selecedrotuineId", selectedRoutineIds)
    setFormData(prev => ({
      ...prev,
      routineIds: selectedRoutineIds,
    }))
    console.log("formaData", formData)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = "Le nom du programme est requis"
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
      const response = await fetch("/api/admin/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Programme créé",
          description: "Le programme a été créé avec succès",
        })
        router.push("/admin/programmes")
      } else {
        const data = await response.json()
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue lors de la création du programme",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating program:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création du programme",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin/programmes">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-2">Nouveau Programme</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informations du programme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                Nom du programme*
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredEquipment">Matériel nécessaire</Label>
              <Textarea
                id="requiredEquipment"
                name="requiredEquipment"
                value={formData.requiredEquipment}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Marche à suivre et appropriation</Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Grandes lignes du programme, infos importantes, conseils..."
                rows={4}
              />
            </div>

            <Selector items={"routines"} onItemSelectAction={handleRoutineSelection} />

            <p className="text-sm text-muted-foreground">* Champs obligatoires</p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link href="/admin/programmes">
              <Button variant="outline" type="button">
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le programme"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
