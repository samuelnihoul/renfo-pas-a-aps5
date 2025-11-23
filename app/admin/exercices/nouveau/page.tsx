"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
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
import VideoUpload from "@/components/video-upload";
import ThumbnailUpload from "@/components/thumbnail-upload";

const exerciseSchema = z.object({
  name: z.string().min(1, "Le nom de l'exercice est requis"),
  muscleGroup: z.string().optional(),
  instructions: z.string(),
  videoPublicId: z.string(),
  thumbnailUrl: z.string().optional(),
  short: z.string(),
  objectifs: z.string(),
  notes: z.string(),
})

type ExerciseFormValues = z.infer<typeof exerciseSchema>

expor function NewExercisePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      muscleGroup: "",
      instructions: "",
      videoPublicId: "",
      thumbnailUrl: "",
      short: "",
      objectifs: "",
      notes: "",
    },
  })

  const handleVideoUrlChange = (url: string) => {
    form.setValue("videoPublicId", url)
  }

  const handleThumbnailUrlChange = (url: string) => {
    form.setValue("thumbnailUrl", url)
  }

  const handleShortUrlChange = (url: string) => {
    form.setValue("short", url)
  }

  const onSubmit = async (data: ExerciseFormValues) => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/admin/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const res = await response.json().catch(() => ({}))
        throw new Error(res.error || "Une erreur est survenue lors de la création de l'exercice")
      }

      toast({ title: "Exercice créé", description: "L'exercice a été créé avec succès" })
      router.push("/admin/exercices")
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de l'exercice",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Informations de l'exercice</CardTitle>
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
                name="muscleGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Groupe musculaire</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Quadriceps, Pectoraux, Dos..." {...field} />
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
                        placeholder="Instructions détaillées pour réaliser l'exercice..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="objectifs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objectifs</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Objectifs de l'exercice..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes personnelles ou remarques sur l'exercice..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel>Vidéo de démonstration</FormLabel>
                  <VideoUpload
                    videoUrl={form.getValues("videoPublicId")}
                    onVideoChange={setVideoFile}
                    onVideoUrlChange={handleVideoUrlChange}
                    inputId="video-upload-main"
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel>Vidéo courte</FormLabel>
                  <VideoUpload
                    videoUrl={form.getValues("short")}
                    onVideoChange={setVideoFile}
                    onVideoUrlChange={handleShortUrlChange}
                    inputId="video-upload-short"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miniature (optionnel)</FormLabel>
                      <FormControl>
                        <ThumbnailUpload
                          thumbnailUrl={field.value}
                          onThumbnailChange={setThumbnailFile}
                          onThumbnailUrlChange={handleThumbnailUrlChange}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Si aucune miniature n'est fournie, une sera générée automatiquement à partir de la vidéo.
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/exercices")}>Annuler</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
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
        </Form>
      </Card>
    </div>
  )
}
