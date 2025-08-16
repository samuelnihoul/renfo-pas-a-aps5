"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface ProgramCardProps {
    program: {
        id: number
        name: string
    }
    userId: string
    hasAccess: boolean
    accessReason?: "purchased" | "free_trial" | "not_purchased"
}

export function ProgramCard({ program, userId, hasAccess, accessReason }: ProgramCardProps) {
    const [isPurchasing, setIsPurchasing] = useState(false)

    const handlePurchase = async () => {
        setIsPurchasing(true)
        try {
            const response = await fetch("/api/programs/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ programId: program.id }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Erreur lors de l'achat")
            }

            const { url } = await response.json()

            // Rediriger vers Stripe Checkout
            if (url) {
                window.location.href = url
            }
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

    const getAccessBadge = () => {
        if (accessReason === "purchased") {
            return <Badge variant="default">Acheté</Badge>
        }
        if (accessReason === "free_trial") {
            return <Badge variant="secondary">Essai gratuit</Badge>
        }
        return <Badge variant="outline">Non acheté</Badge>
    }

    const getActionButton = () => {
        if (hasAccess) {
            return (
                <Button asChild>
                    <a href={`/programmes/${program.id}`}>Commencer</a>
                </Button>
            )
        }

        if (program.id === 1) {
            return (
                <div className="space-y-2">
                    <Button asChild variant="outline">
                        <a href={`/programmes/${program.id}`}>Essayer gratuitement (2 semaines)</a>
                    </Button>
                    <Button onClick={handlePurchase} disabled={isPurchasing}>
                        {isPurchasing ? "Achat en cours..." : "Acheter le programme complet"}
                    </Button>
                </div>
            )
        }

        return (
            <Button onClick={handlePurchase} disabled={isPurchasing}>
                {isPurchasing ? "Achat en cours..." : "Acheter"}
            </Button>
        )
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{program.name}</CardTitle>
                    {getAccessBadge()}
                </div>
            </CardHeader>
            <CardContent>
                {program.id === 1 && (
                    <p className="text-sm text-muted-foreground mb-4">
                        Les deux premières semaines sont gratuites pour tous les utilisateurs !
                    </p>
                )}
                {getActionButton()}
            </CardContent>
        </Card>
    )
} 
