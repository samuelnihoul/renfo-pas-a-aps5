"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function NewExercisePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    tempsReps: "",
    videoPublicId: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setVideoFile(file)
      const fileURL = URL.createObjectURL(file)
      setPreviewUrl(fileURL)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'exercice est requis"
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
      let finalVideoPublicId = formData.videoPublicId

      if (videoFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("video", videoFile)

        const uploadResponse = await fetch("/api/upload/video", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || "Erreur lors du téléchargement de la vidéo")
        }

        const uploadData = await uploadResponse.json()
        finalVideoPublicId = uploadData.fileUrl // Assuming the server returns the publicId
      }

      console.log(formData)
      const response = await fetch("/api/admin/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          videoPublicId: finalVideoPublicId,
        }),
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
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de l'exercice",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push("/admin/exercices")}>
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold ml-2">Nouvel exercice</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informations de l'exercice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                Nom de l'exercice*
              </label>
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
              <label htmlFor="tempsReps">
                Temps/Répétitions
              </label>
              <Textarea
                id="tempsReps"
                name="tempsReps"
                value={formData.tempsReps}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="instructions">Instructions</label>
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
              <label htmlFor="video">Vidéo de démonstration</label>
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
                        setFormData(prev => ({
                          ...prev,
                          videoPublicId: "",
                        }))
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Glissez-déposez ou cliquez pour sélectionner une vidéo</p>
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
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Formats acceptés: MP4, WebM. Taille maximale: 50MB</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/exercices")}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'exercice"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
