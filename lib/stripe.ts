import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-06-30.basil",
    typescript: true,
})

export const createCheckoutSession = async ({
    userId,
    programId,
    programName,
    price,
}: {
    userId: string
    programId: number
    programName: string
    price: number
}) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: programName,
                        description: `Accès complet au programme ${programName}`,
                    },
                    unit_amount: price * 100, // Stripe utilise les centimes
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/programmes?success=true&programId=${programId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/programmes?canceled=true`,
        metadata: {
            userId,
            programId: programId.toString(),
        },
    })

    return session
} 