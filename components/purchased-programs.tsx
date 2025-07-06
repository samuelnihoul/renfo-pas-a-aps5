"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

interface PurchasedProgram {
    id: number
    userId: number
    programId: number
    purchaseDate: string
    program: {
        id: number
        name: string
        material: string
    }
}

export function PurchasedPrograms() {
    const [purchasedPrograms, setPurchasedPrograms] = useState<PurchasedProgram[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPurchasedPrograms = async () => {
            try {
                const response = await fetch("/api/programs/purchased")
                if (!response.ok) {
                    throw new Error("Erreur lors du chargement des programmes achetés")
                }
                const data = await response.json()
                setPurchasedPrograms(data)
            } catch (error) {
                console.error("Error fetching purchased programs:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchPurchasedPrograms()
    }, [])

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
        )
    }

    if (purchasedPrograms.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                        Vous n'avez pas encore acheté de programmes.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {purchasedPrograms.map((purchased) => (
                <Card key={purchased.id}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{purchased.program.name}</CardTitle>
                            <Badge variant="default">Acheté</Badge>
                        </div>
                        <CardDescription>
                            Matériel requis : {purchased.program.material}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                Acheté le {new Date(purchased.purchaseDate).toLocaleDateString("fr-FR")}
                            </div>
                            <Button asChild>
                                <a href={`/programmes/${purchased.programId}`}>Continuer</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
} 