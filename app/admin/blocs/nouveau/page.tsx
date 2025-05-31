"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import Selector from "@/components/admin/selector"

enum BlockTypes {
    Exercises = "Exercices",
    Routines = "Routines",
    Programmes = "Programmes",
}

export default function NewProgram() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        type: BlockTypes.Exercises,
        setsInfo: "",
        repsInfo: "",
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

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
            type: value as BlockTypes,
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
            const response = await fetch("/api/admin/blocks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast({
                    title: "Bloc créé",
                    description: "Le bloc a été créé avec succès",
                })
                router.push("/admin/blocks")
            } else {
                const data = await response.json()
                toast({
                    title: "Erreur",
                    description: data.error || "Une erreur est survenue lors de la création du bloc",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error creating block:", error)
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création du bloc",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="flex items-center mb-6">
                <Link href="/admin/blocks">
                    <Button variant="ghost" size="sm" className="gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold ml-2">Nouveau bloc</h1>
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
                            <Label htmlFor="type">Type de bloc</Label>
                            <Select onValueChange={handleSelectChange} defaultValue={formData.type}>
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

                        <Selector items={"blocs"} />

                        <div className="space-y-2">
                            <Label htmlFor="setsInfo">Information sur les sets</Label>
                            <Input
                                id="setsInfo"
                                name="setsInfo"
                                value={formData.setsInfo}
                                onChange={handleChange}
                                placeholder="Information sur les sets"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="repsInfo">Information sur les reps</Label>
                            <Input
                                id="repsInfo"
                                name="repsInfo"
                                value={formData.repsInfo}
                                onChange={handleChange}
                                placeholder="Information sur les reps"
                            />
                        </div>

                        <p className="text-sm text-muted-foreground">* Champs obligatoires</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Link href="/admin/blocks">
                            <Button variant="outline" type="button">
                                Annuler
                            </Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Création..." : "Créer le bloc"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
