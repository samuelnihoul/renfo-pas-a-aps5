"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
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
})

type ExerciseFormValues = z.infer<typeof exerciseSchema>

export default function EditExercisePage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

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
    })

    // Récupérer les données de l'exercice au chargement
    useEffect(() => {
        const fetchExercise = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/admin/exercises/${params.id}`)

                if (!response.ok) {
                    // Si l'exercice n'existe pas ou autre erreur
                    const data = await response.json()
                    throw new Error(data.error || "Erreur lors de la récupération de l'exercice")
                }

                const exercise = await response.json()

                // Mise à jour des valeurs du formulaire
                form.reset({
                    name: exercise.name,
                    description: exercise.description || "",
                    muscleGroup: exercise.muscleGroup,
                    difficulty: exercise.difficulty,
                    instructions: exercise.instructions || "",
                    videoUrl: exercise.videoUrl || "",
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
    }, [params.id, form])

    // Soumission du formulaire
    const onSubmit = async (data: ExerciseFormValues) => {
        setSubmitting(true)

        try {
            const response = await fetch(`/api/admin/exercises/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

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
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Lien vers une vidéo démontrant l'exercice (facultatif)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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