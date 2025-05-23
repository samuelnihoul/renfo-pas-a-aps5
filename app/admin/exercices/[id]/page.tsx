"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {Loader2, CheckCircle, AlertCircle, Upload} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import VideoUpload from "@/components/video-upload"
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Définition du schéma de validation
const exerciseSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    description: z.string().optional(),
    muscleGroup: z.string().min(1, "Le groupe musculaire est requis"),
    difficulty: z.string().min(1, "La difficulté est requise"),
    instructions: z.string().optional(),
    videoUrl: z.string().optional(),
    videoPublicId: z.string().optional(),
})

type ExerciseFormValues = z.infer<typeof exerciseSchema>

export default function EditExercisePage({ params }: { params: { id: string } }) {
    const wrappedId = React.use(params as any) as { id: string }
    const id = wrappedId.id

    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
    const [uploadError, setUploadError] = useState("")

    // Configuration du formulaire
    const form = useForm<ExerciseFormValues>({
        resolver: zodResolver(exerciseSchema),
        defaultValues: {
            name: "",
            description: "",
            muscleGroup: "",
            difficulty: "",
            instructions: "",
            videoUrl: "",
        },
    })    // Récupérer les données de l'exercice au chargement
    useEffect(() => {
        const fetchExercise = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/admin/exercises/${id}`)

                if (!response.ok) {
                    // Si l'exercice n'existe pas ou autre erreur
                    const data = await response.json()
                    throw new Error(data.error || "Erreur lors de la récupération de l'exercice")
                } const exercise = await response.json()

                // Mise à jour des valeurs du formulaire
                form.reset({
                    name: exercise.name,
                    description: exercise.description || "",
                    muscleGroup: exercise.muscleGroup,
                    difficulty: exercise.difficulty,
                    instructions: exercise.instructions || "",
                    videoUrl: exercise.videoUrl || "",
                    videoPublicId: exercise.videoPublicId || "",
                })

                setError(null)
            } catch (err) {
                console.error("Error fetching exercise:", err)
                setError(err instanceof Error ? err.message : "Erreur lors de la récupération de l'exercice")
            } finally {
                setLoading(false)
            }
        }

        fetchExercise()
    }, [id, form])    // Gérer le téléchargement de fichier vidéo
    const handleVideoChange = (file: File | null) => {
        setVideoFile(file)
        if (file) {
            setUploadStatus("idle")
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setVideoFile(file);

            // Create preview URL
            const fileURL = URL.createObjectURL(file);
            setPreviewUrl(fileURL);
            setUploadStatus("idle");
        }
    }

    const handleVideoUrlChange = (url: string) => {
        form.setValue("videoUrl", url)
    }    // Soumission du formulaire
    const onSubmit = async (data: ExerciseFormValues) => {
        setSubmitting(true);

        try {
            let finalVideoUrl = data.videoUrl;            // Si un fichier vidéo a été sélectionné, on l'upload d'abord
            if (videoFile) {
                setUploadStatus("uploading");
                setUploadProgress(0);

                try {
                    // Simuler la progression de l'upload
                    const progressInterval = setInterval(() => {
                        setUploadProgress((prev) => {
                            if (prev >= 90) {
                                clearInterval(progressInterval);
                                return prev;
                            }
                            return prev + 3; // Progression plus lente pour être plus réaliste
                        });
                    }, 200);

                    const uploadFormData = new FormData();
                    uploadFormData.append("video", videoFile);

                    console.log("Début du téléchargement de la vidéo...");

                    // Notification de démarrage d'upload
                    toast({
                        title: "Téléchargement en cours",
                        description: "La vidéo est en cours d'envoi vers le serveur...",
                    });

                    const uploadResponse = await fetch("/api/upload/video", {
                        method: "POST",
                        body: uploadFormData,
                    });

                    clearInterval(progressInterval); if (!uploadResponse.ok) {
                        const errorData = await uploadResponse.json();
                        setUploadStatus("error");
                        setUploadError(errorData.error || "Erreur lors du téléchargement de la vidéo");

                        // Notification d'erreur
                        toast({
                            title: "Échec du téléchargement",
                            description: errorData.error || "La vidéo n'a pas pu être téléchargée",
                            variant: "destructive"
                        });

                        throw new Error(errorData.error || "Erreur lors du téléchargement de la vidéo");
                    }

                    const uploadData = await uploadResponse.json();
                    finalVideoUrl = uploadData.fileUrl;
                    const videoPublicId = uploadData.publicId;
                    // Mettre à jour le champ videoPublicId dans le formulaire
                    form.setValue("videoPublicId", videoPublicId);
                    setUploadProgress(100);
                    setUploadStatus("success");

                    // Notification de succès
                    toast({
                        title: "Téléchargement réussi",
                        description: "La vidéo a été téléchargée avec succès et sera enregistrée lors de la sauvegarde du formulaire.",
                    });
                } catch (error) {
                    setUploadStatus("error");
                    setUploadError(error instanceof Error ? error.message : "Erreur lors du téléchargement de la vidéo");
                    throw error;
                }
            }

            const response = await fetch(`/api/admin/exercises/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    videoUrl: finalVideoUrl,
                    videoPublicId: form.getValues("videoPublicId"),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Erreur lors de la mise à jour de l'exercice")
            }

            toast({
                title: "Exercice mis à jour",
                description: "L'exercice a été mis à jour avec succès",
            })

            // Redirection vers la liste des exercices
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

    if (error) {
        return (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                <p>{error}</p>
                <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => router.push("/admin/exercices")}
                >
                    Retour aux exercices
                </Button>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Modifier l'exercice</h1>
                <Button
                    variant="outline"
                    onClick={() => router.push("/admin/exercices")}
                >
                    Retour
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informations de l'exercice</CardTitle>
                    <CardDescription>
                        Modifiez les détails de l'exercice ci-dessous.
                    </CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom</FormLabel>
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
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un groupe musculaire" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Jambes">Jambes</SelectItem>
                                                    <SelectItem value="Bras">Bras</SelectItem>
                                                    <SelectItem value="Dos">Dos</SelectItem>
                                                    <SelectItem value="Poitrine">Poitrine</SelectItem>
                                                    <SelectItem value="Épaules">Épaules</SelectItem>
                                                    <SelectItem value="Abdominaux">Abdominaux</SelectItem>
                                                    <SelectItem value="Full Body">Full Body</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="difficulty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Difficulté</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner une difficulté" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Débutant">Débutant</SelectItem>
                                                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                                                    <SelectItem value="Avancé">Avancé</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Décrivez brièvement l'exercice"
                                                className="resize-none"
                                                rows={3}
                                                {...field}
                                            />
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

                            <FormField
                                control={form.control}
                                name="videoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL de la vidéo</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://example.com/video.mp4"
                                                {...field}
                                                value={field.value || ""}
                                                disabled={!!previewUrl}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Lien vers une vidéo démontrant l'exercice (facultatif)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />                            <div className="space-y-2">
                                <FormLabel htmlFor="video-upload">Télécharger une vidéo</FormLabel>                                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                                    {previewUrl ? (
                                        <div className="w-full">                                            <video src={previewUrl} controls className="w-full h-48 object-cover rounded-md mb-2" />

                                            {/* Affichage du nom du fichier */}
                                            {videoFile && (
                                                <div className="flex items-center gap-2 my-2 text-sm">
                                                    <Upload className="h-4 w-4 text-primary" />
                                                    <span className="font-medium text-gray-700">
                                                        {videoFile.name} ({Math.round(videoFile.size / 1024)}KB)
                                                    </span>
                                                </div>
                                            )}

                                            {/* Indicateurs d'état d'upload */}
                                            {uploadStatus === "uploading" && (
                                                <div className="mt-2 mb-2">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                        <span className="text-sm font-medium">Téléchargement en cours... {uploadProgress}%</span>
                                                    </div>
                                                    <Progress value={uploadProgress} className="h-2" />
                                                </div>
                                            )}

                                            {uploadStatus === "success" && (
                                                <div className="flex items-center gap-2 mt-2 mb-2 text-green-600 bg-green-50 p-2 rounded-md">
                                                    <CheckCircle className="h-5 w-5" />
                                                    <span className="text-sm font-medium">Téléchargement réussi! La vidéo sera enregistrée quand vous sauvegarderez.</span>
                                                </div>
                                            )}

                                            {uploadStatus === "error" && (
                                                <div className="flex items-center gap-2 mt-2 mb-2 text-red-600 bg-red-50 p-2 rounded-md">
                                                    <AlertCircle className="h-5 w-5" />
                                                    <span className="text-sm font-medium">{uploadError || "Erreur lors du téléchargement"}</span>
                                                </div>
                                            )}

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setVideoFile(null);
                                                    setPreviewUrl(null);
                                                    setUploadStatus("idle");
                                                }}
                                                disabled={uploadStatus === "uploading"}
                                            >
                                                Supprimer
                                            </Button>
                                        </div>
                                    ) : form.watch("videoUrl") ? (
                                        <div className="w-full">
                                            <video src={form.watch("videoUrl")} controls className="w-full h-48 object-cover rounded-md mb-2" />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    form.setValue("videoUrl", "");
                                                }}
                                            >
                                                Supprimer la vidéo existante
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-col items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Glissez-déposez ou cliquez pour sélectionner une vidéo
                                                </p>
                                                <Input id="video-upload" type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        document.getElementById("video-upload")?.click();
                                                    }}
                                                >
                                                    Sélectionner un fichier
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Formats acceptés: MP4, WebM. Taille maximale: 50MB</p>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/admin/exercices")}
                            >
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