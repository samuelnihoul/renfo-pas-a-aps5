//app/admin/programmes/[id]/page.tsx
"use client"
import React from 'react'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Selector from "@/components/admin/selector"

type Program = {
  id: number
  name: string
  material: string
  routineId: number[]
  instructions?: string
}

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const unwrappedParams = React.use(params as Promise<{ id: string }>)
  const id = unwrappedParams.id
  const router = useRouter()
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/programs/${id}`)
        if (response.ok) {
          const data = await response.json()
          setProgram(data[0])
        } else {
          console.error("Failed to fetch program")
          toast({
            title: "Erreur",
            description: "Impossible de charger les données du programme",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching program:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du programme",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProgram()
  }, [id])

  const handleProgramChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (program) {
      setProgram({
        ...program,
        [name]: value,
      })
    }
  }

  const handleRoutineSelection = (selectedRoutineIds: number[]) => {
    if (program) {
      setProgram({
        ...program,
        routineId: selectedRoutineIds,
      })
    }
  }

  const handleSaveProgram = async () => {
    if (!program) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/programs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(program),
      })

      if (!response.ok) {
        throw new Error("Failed to update program")
      }
      toast({
        title: "Programme mis à jour",
        description: "Le programme a été mis à jour avec succès",
      })
    } catch (error) {
      console.error("Error updating program:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du programme",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Chargement du programme...</span>
      </div>
    )
  }

  if (!program) {
    return <div>Programme non trouvé</div>
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
        <h1 className="text-2xl font-bold ml-2">Modifier le programme</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du programme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du programme</Label>
            <Input id="name" name="name" value={program.name} onChange={handleProgramChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="material">Matériel nécessaire</Label>
            <Input
              id="material"
              name="material"
              value={program.material}
              onChange={handleProgramChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Marche à suivre et appropriation</Label>
            <Textarea
              id="instructions"
              name="instructions"
              value={program.instructions || ""}
              onChange={handleProgramChange}
              placeholder="Grandes lignes du programme, infos importantes, conseils..."
              rows={4}
            />
          </div>

          <Selector items={"routines"} onItemSelectAction={handleRoutineSelection} selectedItemIds={program.routineId} />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveProgram} disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
