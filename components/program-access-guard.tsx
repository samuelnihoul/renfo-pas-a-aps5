"use client"

import { useProgramAccess } from "@/hooks/use-program-access"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"

interface ProgramAccessGuardProps {
    userId: number
    programId: number
    dayNumber?: number
    children: React.ReactNode
}

export function ProgramAccessGuard({ userId, programId, dayNumber, children }: ProgramAccessGuardProps) {
    const { hasAccess, reason, loading, error } = useProgramAccess(userId, programId, dayNumber)
    const [isPurchasing, setIsPurchasing] = useState(false)

    const handlePurchase = async () => {
        setIsPurchasing(true)
        try {
            const response = await fetch("/api/programs/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, programId }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Erreur lors de l'achat")
            }

            toast({
                title: "Achat réussi !",
                description: "Vous avez maintenant accès à ce programme",
            })

            // Recharger la page pour mettre à jour l'état
            window.location.reload()
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Erreur lors de l'achat",
                variant: "destructive",
            })
        } finally {
            setIsPurchasing(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-destructive">Erreur</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (hasAccess) {
        return <>{children}</>
    }

    // Pas d'accès
    return (
        <div className="container mx-auto py-8">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Accès restreint</CardTitle>
                    <CardDescription>
                        {programId === 1 && dayNumber && dayNumber <= 14
                            ? "Vous devez acheter ce programme pour continuer après les 2 premières semaines."
                            : "Vous devez acheter ce programme pour y accéder."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {programId === 1 && (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">Essai gratuit</Badge>
                            <span className="text-sm text-muted-foreground">
                                Les 2 premières semaines sont gratuites
                            </span>
                        </div>
                    )}

                    <Button onClick={handlePurchase} disabled={isPurchasing} className="w-full">
                        {isPurchasing ? "Achat en cours..." : "Acheter ce programme"}
                    </Button>

                    <Button variant="outline" asChild className="w-full">
                        <a href="/programmes">Retour aux programmes</a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
} 