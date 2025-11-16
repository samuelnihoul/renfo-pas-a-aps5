import { useState, useEffect } from "react"

export function useHasPurchasedProgram(userId: string) {
    const [hasPurchased, setHasPurchased] = useState<boolean | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const checkPurchasedPrograms = async () => {
            if (!userId) {
                setLoading(false)
                return
            }

            try {
                const response = await fetch("/api/programs/has-purchased-any")
                
                if (!response.ok) {
                    throw new Error("Erreur lors de la vérification des programmes achetés")
                }

                const data = await response.json()
                setHasPurchased(data.hasPurchased)
            } catch (err) {
                console.error("Error checking purchased programs:", err)
                setError("Une erreur est survenue lors de la vérification de vos achats")
            } finally {
                setLoading(false)
            }
        }

        checkPurchasedPrograms()
    }, [userId])

    return { hasPurchased, loading, error }
}
