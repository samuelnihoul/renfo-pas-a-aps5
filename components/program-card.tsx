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
        shopDescription?: string
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
                <Button asChild className="w-full">
                    <a href={`/`} className="w-full text-center">Commencer</a>
                </Button>
            )
        }

        if (program.id === 1) {
            return (
                <div className="space-y-2 w-full">
                    <Button asChild variant="outline" className="w-full">
                        <a href={`/programmes/${program.id}`} className="w-full text-center">Essayer gratuitement (2 semaines)</a>
                    </Button>
                    <Button 
                        onClick={handlePurchase} 
                        disabled={isPurchasing} 
                        className="w-full"
                    >
                        {isPurchasing ? "Achat en cours..." : "Acheter le programme complet"}
                    </Button>
                </div>
            )
        }

        return (
            <Button 
                onClick={handlePurchase} 
                disabled={isPurchasing}
                className="w-full"
            >
                {isPurchasing ? "Achat en cours..." : "Acheter"}
            </Button>
        )
    }

    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg line-clamp-2">{program.name}</CardTitle>
                    <div className="flex-shrink-0">
                        {getAccessBadge()}
                    </div>
                </div>
                {program.shopDescription && (
                    <CardDescription className="mt-2 text-sm text-muted-foreground line-clamp-3">
                        {program.shopDescription}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="px-4 py-3 sm:px-6 sm:py-4">
                {program.id === 1 && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                        Les deux premières semaines sont gratuites pour tous les utilisateurs !
                    </p>
                )}
                <div className="w-full">
                    {getActionButton()}
                </div>
            </CardContent>
        </Card>
    )
} 
