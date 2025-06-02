"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import ItemSelectorAndOrganizer from "@/components/admin/selector"
import { BlockAdd } from '@/db/schema'

enum BlockTypes {
    Activation = "Activation",
    Développement = "Développement",
    Mobilité = "Mobilité",
}

export default function EditBlockPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState<BlockAdd>({
        focus: BlockTypes.Activation,
        exerciceId: [],
        name: "",
        sets: "",
        restTime: ""
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        const fetchBlock = async () => {
            try {
                const response = await fetch(`/api/blocs/${params.id}`)
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération du bloc")
                }
                const block = await response.json()
                setFormData(block)
            } catch (error) {
                console.error("Error fetching block:", error)
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
    }, [params.id])

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
        setFormData(prev => ({
            ...prev,
            exerciceId: selectedExerciseIds,
        }))
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
            const response = await fetch(`/api/admin/blocs/${params.id}`, {
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
                                value={formData.name}
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

                        <ItemSelectorAndOrganizer items={"exercises"} onItemSelectAction={handleExerciseSelection} selectedItems={formData.exerciceId} />

                        <div className="space-y-2">
                            <Label htmlFor="sets">Sets</Label>
                            <Input
                                id="sets"
                                name="sets"
                                value={formData.sets}
                                onChange={handleChange}
                                placeholder="Sets"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="restTime">Temps de repos</Label>
                            <Input
                                id="restTime"
                                name="restTime"
                                value={formData.restTime as string}
                                onChange={handleChange}
                                placeholder="Temps de repos"
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
