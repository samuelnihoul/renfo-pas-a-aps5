import { useState, useEffect } from "react"

interface ProgramAccess {
    hasAccess: boolean
    reason?: "purchased" | "free_trial" | "not_purchased"
    loading: boolean
    error?: string
}

export function useProgramAccess(userId: number, programId: number, dayNumber?: number) {
    const [access, setAccess] = useState<ProgramAccess>({
        hasAccess: false,
        loading: true,
    })

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const response = await fetch("/api/programs/access", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, programId, dayNumber }),
                })

                if (!response.ok) {
                    throw new Error("Erreur lors de la vérification d'accès")
                }

                const data = await response.json()
                setAccess({
                    hasAccess: data.hasAccess,
                    reason: data.reason,
                    loading: false,
                })
            } catch (error) {
                setAccess({
                    hasAccess: false,
                    loading: false,
                    error: error instanceof Error ? error.message : "Erreur inconnue",
                })
            }
        }

        if (userId && programId) {
            checkAccess()
        }
    }, [userId, programId, dayNumber])

    return access
} 