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
    stripeProductId,
}: {
    userId: string
    programId: number
    programName: string
    stripeProductId: string
}) => {
    // Vérifier si le produit existe dans Stripe
    try {
        await stripe.products.retrieve(stripeProductId);
    } catch (error) {
        console.error("Stripe product not found:", error);
        throw new Error("Product not found in Stripe");
    }

    // Récupérer le prix du produit depuis Stripe
    const prices = await stripe.prices.list({
        product: stripeProductId,
        active: true,
        limit: 1,
    });

    if (prices.data.length === 0) {
        throw new Error("No active price found for this product");
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price: prices.data[0].id,
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/programmes?success=true&programId=${programId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/programmes?canceled=true`,
	allow_promotion_codes:true,
        metadata: {
            userId,
            programId: programId.toString(),
            stripeProductId,
        },
    });

    return session;
}
