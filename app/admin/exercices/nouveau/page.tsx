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
import VideoUpload from "@/components/video-upload";

export default function NewExercisePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    objectifs: "",
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

  const handleVideoUrlChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      videoPublicId: url,
    }))
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
        // No need to upload here, handled by VideoUpload
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
              <label htmlFor="objectifs">Objectifs</label>
              <Textarea
                id="objectifs"
                name="objectifs"
                value={formData.objectifs}
                onChange={handleChange}
                rows={4}
                placeholder="Objectifs de l'exercice..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="video">Vidéo de démonstration</label>
              <VideoUpload
                videoUrl={formData.videoPublicId}
                onVideoChange={setVideoFile}
                onVideoUrlChange={handleVideoUrlChange}
              />
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
