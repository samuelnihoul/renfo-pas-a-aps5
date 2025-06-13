"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Define validation schema
const exerciseSchema = z.object({
  name: z.string().min(1, "Le nom de l'exercice est requis"),
  instructions: z.string(),
  videoPublicId: z.string(),
  tempsReps: z.string(),
})

type ExerciseFormValues = z.infer<typeof exerciseSchema>

export default function EditExercisePage({ params }: { params: { id: string } }) {
  const awaitedParams=React.use(params)
  const { id } = awaitedParams
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      instructions: "",
      videoPublicId: "",
      tempsReps: "",
    },
  })

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/exercises/${id}`)
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Erreur lors de la récupération de l'exercice")
        }

        const exercise = await response.json()
        form.reset({
          name: exercise.name,
          instructions: exercise.instructions || "",
          videoPublicId: exercise.videoPublicId || "",
          tempsReps: exercise.tempsReps || "",
        })

        // Set preview URL if there is an existing video
        if (exercise.videoPublicId) {
          setPreviewUrl(`/videos/${exercise.videoPublicId}`)
        }
      } catch (err) {
        console.error("Error fetching exercise:", err)
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Erreur lors de la récupération de l'exercice",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchExercise()
  }, [id, form])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      setVideoFile(file)
      const fileURL = URL.createObjectURL(file)
      setPreviewUrl(fileURL)
    }
  }

  const onSubmit = async (data: ExerciseFormValues) => {
    setSubmitting(true)
    try {
      let finalVideoPublicId = data.videoPublicId

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
        finalVideoPublicId = uploadData.publicId
        form.setValue("videoPublicId", finalVideoPublicId)
      }

      const response = await fetch(`/api/admin/exercises/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          videoPublicId: finalVideoPublicId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la mise à jour de l'exercice")
      }

      toast({
        title: "Exercice mis à jour",
        description: "L'exercice a été mis à jour avec succès",
      })

      router.push("/admin/exercices")
    } catch (err) {
      console.error("Error updating exercise:", err)
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'exercice",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Chargement de l'exercice...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push("/admin/exercices")}>
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold ml-2">Modifier l'exercice</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Informations de l'exercice</CardTitle>
              <CardDescription>Modifiez les détails de l'exercice ci-dessous.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'exercice*</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'exercice" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tempsReps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temps/Répétitions</FormLabel>
                    <FormControl>
                      <Input placeholder="Temps/Répétitions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Détaillez les étapes pour réaliser l'exercice"
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Vidéo de démonstration</FormLabel>
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
                          form.setValue("videoPublicId", "")
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Glissez-déposez ou cliquez pour sélectionner une vidéo</p>
                      <Input id="video-upload" type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          document.getElementById("video-upload")?.click()
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
              <Button type="submit" disabled={submitting}>
                {submitting ? (
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
        </Form>
      </Card>
    </div>
  )
}
