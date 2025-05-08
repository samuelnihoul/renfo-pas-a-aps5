"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash, ArrowUp, ArrowDown, X, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Exercise = {
  id: number
  name: string
  muscleGroup: string
  difficulty: string
}

type DayExercise = {
  exerciseId: number
  exerciseName: string
  sets: number
  reps: string
  restTime: string
  orderIndex: number
  muscleGroup: string
}

type ProgramDay = {
  dayNumber: number
  name: string
  focus: string
  exercises: DayExercise[]
}

export default function NewProgramPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    difficulty: "Débutant",
    duration: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentTab, setCurrentTab] = useState("details")
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [loadingExercises, setLoadingExercises] = useState(false)
  const [programDays, setProgramDays] = useState<ProgramDay[]>([])
  const [newDayName, setNewDayName] = useState("")
  const [newDayFocus, setNewDayFocus] = useState("")
  const [dayError, setDayError] = useState("")
  const [addExerciseDialogOpen, setAddExerciseDialogOpen] = useState(false)
  const [currentDayIndex, setCurrentDayIndex] = useState<number | null>(null)
  const [tempExercise, setTempExercise] = useState({
    exerciseId: 0,
    sets: 3,
    reps: "10",
    restTime: "60s",
  })
  const [filterQuery, setFilterQuery] = useState("")

  // Récupérer la liste des exercices disponibles
  useEffect(() => {
    const fetchExercises = async () => {
      setLoadingExercises(true)
      try {
        const response = await fetch("/api/exercises")
        if (response.ok) {
          const data = await response.json()
          setAvailableExercises(data)
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de charger les exercices",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching exercises:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les exercices",
          variant: "destructive",
        })
      } finally {
        setLoadingExercises(false)
      }
    }

    fetchExercises()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Effacer l'erreur lorsque l'utilisateur modifie le champ
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

    if (!formData.name.trim()) {
      newErrors.name = "Le nom du programme est requis"
    }

    if (!formData.difficulty) {
      newErrors.difficulty = "La difficulté est requise"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addDay = () => {
    if (!newDayName.trim()) {
      setDayError("Le nom du jour est requis")
      return
    }

    setProgramDays((prev) => [
      ...prev,
      {
        dayNumber: prev.length + 1,
        name: newDayName,
        focus: newDayFocus,
        exercises: [],
      },
    ])

    // Réinitialiser les champs
    setNewDayName("")
    setNewDayFocus("")
    setDayError("")
  }

  const removeDay = (dayNumber: number) => {
    setProgramDays((prev) => {
      const filtered = prev.filter(day => day.dayNumber !== dayNumber)
      // Réajuster les numéros de jour
      return filtered.map((day, index) => ({
        ...day,
        dayNumber: index + 1
      }))
    })
  }

  const openAddExerciseDialog = (dayIndex: number) => {
    setCurrentDayIndex(dayIndex)
    setAddExerciseDialogOpen(true)
  }

  const handleTempExerciseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTempExercise((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleExerciseSelection = (id: number) => {
    setTempExercise((prev) => ({
      ...prev,
      exerciseId: id,
    }))
  }

  const addExerciseToDay = () => {
    if (currentDayIndex === null || tempExercise.exerciseId === 0) return

    const selectedExercise = availableExercises.find((ex) => ex.id === tempExercise.exerciseId)
    if (!selectedExercise) return

    setProgramDays((prev) => {
      const newDays = [...prev]
      const day = newDays[currentDayIndex]

      // Calculer le nouvel index d'ordre
      const orderIndex = day.exercises.length > 0
        ? Math.max(...day.exercises.map(ex => ex.orderIndex)) + 1
        : 0

      // Create a new exercises array instead of mutating the existing one
      day.exercises = [
        ...day.exercises,
        {
          exerciseId: tempExercise.exerciseId,
          exerciseName: selectedExercise.name,
          sets: tempExercise.sets,
          reps: tempExercise.reps,
          restTime: tempExercise.restTime,
          orderIndex: orderIndex,
          muscleGroup: selectedExercise.muscleGroup
        }
      ]

      return newDays
    })

    // Réinitialiser
    setTempExercise({
      exerciseId: 0,
      sets: 3,
      reps: "10",
      restTime: "60s",
    })
    setAddExerciseDialogOpen(false)
  }

  const removeExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
    setProgramDays((prev) => {
      const newDays = [...prev]
      newDays[dayIndex].exercises.splice(exerciseIndex, 1)

      // Réajuster les indices d'ordre
      newDays[dayIndex].exercises = newDays[dayIndex].exercises.map((ex, idx) => ({
        ...ex,
        orderIndex: idx
      }))

      return newDays
    })
  }

  const moveExercise = (dayIndex: number, exerciseIndex: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && exerciseIndex === 0) ||
      (direction === 'down' && exerciseIndex === programDays[dayIndex].exercises.length - 1)
    ) {
      return // Déjà au début ou à la fin
    }

    setProgramDays((prev) => {
      const newDays = [...prev]
      const day = newDays[dayIndex]
      const newExercises = [...day.exercises]

      const targetIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1

      // Échanger les exercices
      const temp = newExercises[exerciseIndex];
      newExercises[exerciseIndex] = newExercises[targetIndex];
      newExercises[targetIndex] = temp;

      // Mettre à jour les orderIndex
      newExercises.forEach((ex, idx) => {
        ex.orderIndex = idx
      })

      day.exercises = newExercises
      return newDays
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Vérifier qu'il y a au moins un jour dans le programme
    if (programDays.length === 0) {
      toast({
        title: "Erreur",
        description: "Vous devez ajouter au moins un jour d'entraînement",
        variant: "destructive",
      })
      setCurrentTab("days")
      return
    }

    setLoading(true)

    try {
      const programData = {
        ...formData,
        days: programDays
      }

      const response = await fetch("/api/admin/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(programData),
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
        description: "Une erreur est survenue lors de la création du programme",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les exercices pour la recherche
  const filteredExercises = availableExercises.filter(ex =>
    ex.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    ex.muscleGroup.toLowerCase().includes(filterQuery.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin/programmes">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-2">Nouveau programme</h1>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="days">
            Jours d'entraînement
            {programDays.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {programDays.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="max-w-2xl mx-auto">
            <form>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Description détaillée du programme..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className={errors.difficulty ? "text-destructive" : ""}>
                      Difficulté*
                    </Label>
                    <Select value={formData.difficulty} onValueChange={(value) => handleSelectChange("difficulty", value)}>
                      <SelectTrigger className={errors.difficulty ? "border-destructive" : ""}>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Débutant">Débutant</SelectItem>
                        <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                        <SelectItem value="Avancé">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.difficulty && <p className="text-destructive text-sm">{errors.difficulty}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="ex: 30-45 min"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">* Champs obligatoires</p>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/programmes")}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentTab("days")}
                >
                  Continuer
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="days">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ajouter un jour d'entraînement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dayName" className={dayError ? "text-destructive" : ""}>
                    Nom du jour*
                  </Label>
                  <Input
                    id="dayName"
                    value={newDayName}
                    onChange={(e) => {
                      setNewDayName(e.target.value)
                      if (dayError) setDayError("")
                    }}
                    placeholder="ex: Jour 1 - Haut du corps"
                    className={dayError ? "border-destructive" : ""}
                  />
                  {dayError && <p className="text-destructive text-sm">{dayError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayFocus">Focus (facultatif)</Label>
                  <Input
                    id="dayFocus"
                    value={newDayFocus}
                    onChange={(e) => setNewDayFocus(e.target.value)}
                    placeholder="ex: Poitrine et bras"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={addDay} type="button">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter ce jour
              </Button>
            </CardFooter>
          </Card>

          {programDays.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Jours d'entraînement ({programDays.length})</h2>
              <Accordion type="multiple" className="w-full">
                {programDays.map((day, dayIndex) => (
                  <AccordionItem key={dayIndex} value={`day-${dayIndex}`}>
                    <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Jour {day.dayNumber}: {day.name}</span>
                        {day.focus && (
                          <Badge variant="outline">{day.focus}</Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Exercices ({day.exercises.length})</h3>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => openAddExerciseDialog(dayIndex)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter un exercice
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeDay(day.dayNumber)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer ce jour
                          </Button>
                        </div>
                      </div>

                      {day.exercises.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">#</TableHead>
                              <TableHead>Exercice</TableHead>
                              <TableHead>Groupe</TableHead>
                              <TableHead className="w-[80px]">Séries</TableHead>
                              <TableHead className="w-[100px]">Répétitions</TableHead>
                              <TableHead className="w-[100px]">Repos</TableHead>
                              <TableHead className="w-[150px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {day.exercises.map((exercise, exIndex) => (
                              <TableRow key={exIndex}>
                                <TableCell>{exIndex + 1}</TableCell>
                                <TableCell className="font-medium">{exercise.exerciseName}</TableCell>
                                <TableCell>{exercise.muscleGroup}</TableCell>
                                <TableCell>{exercise.sets}</TableCell>
                                <TableCell>{exercise.reps}</TableCell>
                                <TableCell>{exercise.restTime}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => moveExercise(dayIndex, exIndex, 'up')}
                                      disabled={exIndex === 0}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => moveExercise(dayIndex, exIndex, 'down')}
                                      disabled={exIndex === day.exercises.length - 1}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="text-destructive"
                                      onClick={() => removeExerciseFromDay(dayIndex, exIndex)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <p>Aucun exercice ajouté pour ce jour.</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => openAddExerciseDialog(dayIndex)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter un exercice
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground mb-2">Aucun jour d'entraînement ajouté.</p>
              <p className="text-sm text-muted-foreground mb-4">
                Commencez par ajouter au moins un jour d'entraînement à votre programme.
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentTab("details")}
            >
              Retour aux détails
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || programDays.length === 0}
            >
              {loading ? "Création..." : "Créer le programme"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={addExerciseDialogOpen} onOpenChange={setAddExerciseDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un exercice</DialogTitle>
            <DialogDescription>
              Sélectionnez un exercice et définissez les détails d'exécution.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="exercise-search">Rechercher un exercice</Label>
                <Input
                  id="exercise-search"
                  placeholder="Rechercher par nom ou groupe musculaire"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
              </div>

              <div className="border rounded-md max-h-[350px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Groupe</TableHead>
                      <TableHead>Difficulté</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingExercises ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          Chargement des exercices...
                        </TableCell>
                      </TableRow>
                    ) : filteredExercises.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          Aucun exercice trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExercises.map((exercise) => (
                        <TableRow
                          key={exercise.id}
                          className={`cursor-pointer ${tempExercise.exerciseId === exercise.id ? 'bg-primary/10' : ''}`}
                          onClick={() => handleExerciseSelection(exercise.id)}
                        >
                          <TableCell className="font-medium">{exercise.name}</TableCell>
                          <TableCell>{exercise.muscleGroup}</TableCell>
                          <TableCell>{exercise.difficulty}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sets">Nombre de séries</Label>
                <Input
                  id="sets"
                  name="sets"
                  type="number"
                  min="1"
                  value={tempExercise.sets}
                  onChange={handleTempExerciseChange}
                />
              </div>

              <div>
                <Label htmlFor="reps">Répétitions</Label>
                <Input
                  id="reps"
                  name="reps"
                  placeholder="ex: 10 ou 8-12"
                  value={tempExercise.reps}
                  onChange={handleTempExerciseChange}
                />
              </div>

              <div>
                <Label htmlFor="restTime">Temps de repos</Label>
                <Input
                  id="restTime"
                  name="restTime"
                  placeholder="ex: 60s ou 1min"
                  value={tempExercise.restTime}
                  onChange={handleTempExerciseChange}
                />
              </div>

              {tempExercise.exerciseId > 0 && (
                <div className="mt-6 p-4 border rounded-md bg-primary/5">
                  <h4 className="font-medium mb-2">Exercice sélectionné :</h4>
                  <p>{availableExercises.find(ex => ex.id === tempExercise.exerciseId)?.name}</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddExerciseDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={addExerciseToDay}
              disabled={tempExercise.exerciseId === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
