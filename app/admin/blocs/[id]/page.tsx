//app/admin/blocs/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import ItemSelectorAndOrganizer from "@/components/admin/selector"
import { BlockAdd } from '@/db/schema'
import React from "react"

enum BlockTypes {
    Activation = "Activation",
    Développement = "Développement",
    Mobilité = "Mobilité",
}

export default function EditBlockPage({ params }: { params: { id: string } }) {
    const awaitedParams = React.use(params as any) as { id: string }
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState<BlockAdd>({
        focus: BlockTypes.Activation,
        exerciceId: [],
        exerciseNotes: [],
        name: "",
        instructions: ""
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        const fetchBlock = async () => {
            try {
                console.log("[Frontend] Fetching block with id:", awaitedParams.id);
                const response = await fetch(`/api/blocs/${awaitedParams.id}`);
                console.log("[Frontend] API response status:", response.status);
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération du bloc");
                }
                const block = await response.json();
                console.log("[Frontend] Block data received from API:", block);
                // Normalize exerciseNotes to match exerciceId length
                const exerciceId = block.exerciceId ?? [];
                let exerciseNotes: string[] = [];
                if (Array.isArray(block.exerciseNotes)) {
                    if (block.exerciseNotes.length === exerciceId.length) {
                        exerciseNotes = block.exerciseNotes;
                    } else {
                        exerciseNotes = exerciceId.map((_: any, idx: number) => block.exerciseNotes?.[idx] ?? "");
                    }
                } else {
                    exerciseNotes = exerciceId.map((_: any) => "");
                }
                setFormData({
                    ...block,
                    exerciceId,
                    exerciseNotes,
                });
            } catch (error) {
                console.error("[Frontend] Error fetching block:", error)
                toast({
                    title: "Erreur",
                    description: "Erreur lors de la récupération du bloc",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchBlock()
    }, [awaitedParams.id])

    useEffect(() => {
        console.log("[Frontend] Current formData state:", formData);
    }, [formData]);

    console.log("[Frontend] Rendering form with formData:", formData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            focus: value as BlockTypes,
        }))
    }

    const handleExerciseSelection = (selectedExerciseIds: number[]) => {
        // Prevent resetting to empty if already set
        if (selectedExerciseIds.length === 0 && (formData.exerciceId?.length ?? 0) > 0) {
            return;
        }
        setFormData(prev => ({
            ...prev,
            exerciceId: selectedExerciseIds,
            exerciseNotes: selectedExerciseIds.map((_, idx) => (prev.exerciseNotes ? prev.exerciseNotes[idx] : "") || "")
        }));
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) {
            newErrors.name = "Le nom du bloc est requis"
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
            const response = await fetch(`/api/admin/blocs/${awaitedParams.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast({
                    title: "Bloc mis à jour",
                    description: "Le bloc a été mis à jour avec succès",
                })
                router.push("/admin/blocs")
            } else {
                const data = await response.json()
                toast({
                    title: "Erreur",
                    description: data.error || "Une erreur est survenue lors de la mise à jour du bloc",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error updating block:", error)
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour du bloc",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>Chargement...</div>
    }

    return (
        <div>
            <div className="flex items-center mb-6">
                <Link href="/admin/blocs">
                    <Button variant="ghost" size="sm" className="gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold ml-2">Modifier le bloc</h1>
            </div>

            <Card className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Informations du bloc</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                                Nom du bloc*
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name || ""}
                                onChange={handleChange}
                                className={errors.name ? "border-destructive" : ""}
                            />
                            {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="focus">Type de bloc</Label>
                            <Select onValueChange={handleSelectChange} defaultValue={formData.focus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un type de bloc" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(BlockTypes).map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <ItemSelectorAndOrganizer items={"exercises"} onItemSelectAction={handleExerciseSelection} selectedItemIds={formData.exerciceId} />
                        {(formData.exerciseNotes ?? []).map((note, idx) => (
                            <div key={(formData.exerciceId ?? [])[idx]} className="space-y-2">
                                <Label htmlFor={`exerciseNote-${(formData.exerciceId ?? [])[idx]}`}>Note pour l'exercice {(formData.exerciceId ?? [])[idx]}</Label>
                                <Input
                                    id={`exerciseNote-${(formData.exerciceId ?? [])[idx]}`}
                                    name={`exerciseNote-${(formData.exerciceId ?? [])[idx]}`}
                                    value={note || ""}
                                    onChange={e => {
                                        const newNotes = [...(formData.exerciseNotes ?? [])]
                                        newNotes[idx] = e.target.value
                                        setFormData(prev => ({ ...prev, exerciseNotes: newNotes }))
                                    }}
                                    placeholder="Note personnalisée pour cet exercice"
                                />
                            </div>
                        ))}

                        <div className="space-y-2">
                            <Label htmlFor="instructions">Instructions</Label>
                            <Textarea
                                id="instructions"
                                name="instructions"
                                value={formData.instructions || ""}
                                onChange={handleChange}
                                placeholder="Instructions du bloc"
                            />
                        </div>

                        <p className="text-sm text-muted-foreground">* Champs obligatoires</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Link href="/admin/blocs">
                            <Button variant="outline" type="button">
                                Annuler
                            </Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
