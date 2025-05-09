"use client"

import React from "react"
import type { ComponentType } from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

type Program = {
  id: number
  name: string
  description: string | null
  difficulty: string
  duration: string | null
  days: ProgramDay[]
}

type ProgramDay = {
  id: number
  programId: number
  dayNumber: number
  name: string
  focus: string | null
}

type DayExercise = {
  id: number
  dayId: number
  exerciseId: number
  sets: number
  reps: string
  restTime: string | null
  orderIndex: number
  exercise: {
    id: number
    name: string
    muscleGroup: string
  }
}

export default function EditProgramPage({ params }: { params: { id: string } }) {
  const id = params.id
  const router = useRouter()
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [selectedDay, setSelectedDay] = useState<ProgramDay | null>(null)
  const [dayExercises, setDayExercises] = useState<DayExercise[]>([])

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/programs/${id}`)
        if (response.ok) {
          const data = await response.json()
          setProgram(data)
          if (data.days && data.days.length > 0) {
            setSelectedDay(data.days[0])
            fetchDayExercises(data.days[0].id)
          }
        } else {
          console.error("Failed to fetch program")
        }
      } catch (error) {
        console.error("Error fetching program:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgram()
  }, [id])

  const fetchDayExercises = async (dayId: number) => {
    try {
      const response = await fetch(`/api/programs/${id}/days/${dayId}/exercises`)
      if (response.ok) {
        const data = await response.json()
        setDayExercises(data)
      } else {
        setDayExercises([])
      }
    } catch (error) {
      console.error("Error fetching day exercises:", error)
      setDayExercises([])
    }
  }

  const handleProgramChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (program) {
      setProgram({
        ...program,
        [name]: value,
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (program) {
      setProgram({
        ...program,
        [name]: value,
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
    } catch (error) {
      console.error("Error updating program:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDaySelect = (day: ProgramDay) => {
    setSelectedDay(day)
    fetchDayExercises(day.id)
  }

  const exerciseColumns: ColumnDef<DayExercise>[] = [
    {
      accessorKey: "exercise.name",
      header: "Exercice",
    },
    {
      accessorKey: "exercise.muscleGroup",
      header: "Groupe musculaire",
    },
    {
      accessorKey: "sets",
      header: "Séries",
    },
    {
      accessorKey: "reps",
      header: "Répétitions",
    },
    {
      accessorKey: "restTime",
      header: "Repos",
    },
    {
      accessorKey: "orderIndex",
      header: "Ordre",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <Button variant="ghost" size="icon" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  if (loading) {
    return <div>Chargement du programme...</div>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="details">Détails du programme</TabsTrigger>
          <TabsTrigger value="days">Jours d'entraînement</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={program.description || ""}
                  onChange={handleProgramChange}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulté</Label>
                  <Select value={program.difficulty} onValueChange={(value) => handleSelectChange("difficulty", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Débutant">Débutant</SelectItem>
                      <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                      <SelectItem value="Avancé">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Durée</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={program.duration || ""}
                    onChange={handleProgramChange}
                    placeholder="ex: 30-45 min"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveProgram} disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="days">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Jours</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {program.days.map((day) => (
                      <button
                        key={day.id}
                        className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${selectedDay?.id === day.id ? "bg-muted" : ""
                          }`}
                        onClick={() => handleDaySelect(day)}
                      >
                        <div className="font-medium">{day.name}</div>
                        <div className="text-xs text-muted-foreground">{day.focus}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un jour
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-3">
              {selectedDay ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{selectedDay.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedDay.focus}</p>
                    </div>
                    <Button size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="day-name">Nom du jour</Label>
                          <Input
                            id="day-name"
                            value={selectedDay.name}
                            onChange={(e) => {
                              if (selectedDay) {
                                setSelectedDay({
                                  ...selectedDay,
                                  name: e.target.value,
                                })
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="day-focus">Focus</Label>
                          <Input
                            id="day-focus"
                            value={selectedDay.focus || ""}
                            onChange={(e) => {
                              if (selectedDay) {
                                setSelectedDay({
                                  ...selectedDay,
                                  focus: e.target.value,
                                })
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Exercices</h3>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un exercice
                          </Button>
                        </div>
                        <DataTable columns={exerciseColumns} data={dayExercises} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Sélectionnez un jour pour voir les détails</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
