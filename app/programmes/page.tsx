"use client"

import { useEffect, useState } from "react"
import { ProgramCard } from "@/components/program-card"
import { useProgramAccess } from "@/hooks/use-program-access"
import { PurchasedPrograms } from "@/components/purchased-programs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Program {
    id: number
    name: string
    material: string
}

export default function ProgrammesPage() {
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)
    const { user, loading: authLoading, isAuthenticated } = useAuth()

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await fetch("/api/programs")
                if (!response.ok) {
                    throw new Error("Erreur lors du chargement des programmes")
                }
                const data = await response.json()
                setPrograms(data)
            } catch (error) {
                console.error("Error fetching programs:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchPrograms()
    }, [])

    if (loading || authLoading) {
        return (
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-8">Programmes d'entraînement</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-8">Programmes d'entraînement</h1>
                <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground mb-4">
                        Connectez-vous pour accéder aux programmes d'entraînement
                    </p>
                    <div className="space-x-4">
                        <Button asChild>
                            <Link href="/auth/signin">Se connecter</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/auth/signup">S'inscrire</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Programmes d'entraînement</h1>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="all">Tous les programmes</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.map((program) => (
                            <ProgramAccessWrapper key={program.id} program={program} userId={user!.userId} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function ProgramAccessWrapper({ program, userId }: { program: Program; userId: string }) {
    const { hasAccess, reason, loading } = useProgramAccess(userId, program.id)

    if (loading) {
        return <div className="h-64 bg-muted animate-pulse rounded-lg" />
    }

    return (
        <ProgramCard
            program={program}
            userId={userId}
            hasAccess={hasAccess}
            accessReason={reason}
        />
    )
} 