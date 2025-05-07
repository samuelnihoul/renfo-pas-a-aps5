"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export default function NewExercisePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    muscleGroup: "",
    difficulty: "Débutant",
    instructions: "",
    videoUrl: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Dans un environnement réel, vous téléchargeriez le fichier et obtiendriez une URL
      // Pour l'instant, nous allons simplement utiliser l'URL locale pour la démonstration
      setFormData((prev) => ({
        ...prev,
        videoUrl: url,
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'exercice est requis"
    }

    if (!formData.muscleGroup) {
      newErrors.muscleGroup = "Le groupe musculaire est requis"
    }

    if (!formData.difficulty) {
      newErrors.difficulty = "La difficulté est requise"
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
      // Dans un environnement réel, vous téléchargeriez d'abord la vidéo
      // puis utiliseriez l'URL retournée dans les données du formulaire

      const response = await fetch("/api/admin/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Exercice créé",
          description: "L'exercice a été créé avec succès",
        })
        router.push("/admin/exercices")
      } else {
        const data = await response.json()
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue lors de la création de l'exercice",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating exercise:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'exercice",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const muscleGroups = [
    "Jambes",
    "Quadriceps",
    "Ischio-jambiers",
    "Mollets",
    "Fessiers",
    "Abdominaux",
    "Dos",
    "Poitrine",
    "Épaules",
    "Bras",
    "Stabilisateurs",
  ]

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin/exercices">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-2">Nouvel exercice</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informations de l'exercice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                Nom de l'exercice*
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
                rows={3}
                placeholder="Description de l'exercice..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="muscleGroup" className={errors.muscleGroup ? "text-destructive" : ""}>
                  Groupe musculaire*
                </Label>
                <Select
                  value={formData.muscleGroup}
                  onValueChange={(value) => handleSelectChange("muscleGroup", value)}
                >
                  <SelectTrigger className={errors.muscleGroup ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.muscleGroup && <p className="text-destructive text-sm">{errors.muscleGroup}</p>}
              </div>

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                placeholder="Instructions détaillées pour réaliser l'exercice..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video">Vidéo de démonstration</Label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                {previewUrl ? (
                  <div className="w-full">
                    <video src={previewUrl} controls className="w-full h-48 object-cover rounded-md mb-2" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setVideoFile(null)
                        setPreviewUrl(null)
                        setFormData((prev) => ({
                          ...prev,
                          videoUrl: "",
                        }))
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Glissez-déposez ou cliquez pour sélectionner une vidéo
                    </p>
                    <Input id="video" type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        document.getElementById("video")?.click()
                      }}
                    >
                      Sélectionner un fichier
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Formats acceptés: MP4, WebM. Taille maximale: 50MB</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL de la vidéo (alternative)</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://exemple.com/video.mp4"
                disabled={!!previewUrl}
              />
              <p className="text-xs text-muted-foreground">
                Si vous n'avez pas de fichier à télécharger, vous pouvez fournir une URL directe vers une vidéo.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">* Champs obligatoires</p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link href="/admin/exercices">
              <Button variant="outline" type="button">
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer l'exercice"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
