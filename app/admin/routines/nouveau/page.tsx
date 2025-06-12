//routines/nouvau/page
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import ItemSelectorAndOrganizer from "@/components/admin/selector"
import { RoutineAdd } from '@/db/schema'

export default function NewRoutine() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<RoutineAdd>({
    blockId: [],
    name: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setLoading(true)
    try {
      const response = await fetch("/api/admin/routines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Routine créée",
          description: "La routine a été créée avec succès",
        })
        router.push("/admin/routines")
      } else {
        const data = await response.json()
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue lors de la création de la routine",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating routine:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de la routine",
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
          <h1 className="text-2xl font-bold ml-2">Nouvelle routine</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Informations de la routine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                  Nom de la routine*
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

              <ItemSelectorAndOrganizer items={"blocs"} onItemSelectAction={handleBlockSelection} />

              <p className="text-sm text-muted-foreground">* Champs obligatoires</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Link href="/admin/routines">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Création..." : "Créer la routine"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
  )
}
