"use server"

import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

export async function GET() {
    try {
        // Vérifier la configuration actuelle
        const config = cloudinary.config();

        // Masquer la clé API mais afficher son format pour déboguer
        const apiKeyInfo = config.api_key ? {
            length: config.api_key.length,
            firstChars: config.api_key.substring(0, 3) + "...",
            lastChars: "..." + config.api_key.substring(config.api_key.length - 3)
        } : "non définie";

        // Vérifier la connectivité en faisant un appel simple
        const testResult = await cloudinary.api.ping();

        return NextResponse.json({
            success: true,
            configStatus: {
                cloud_name: config.cloud_name || "non défini",
                apiKeyInfo,
                secure: config.secure
            },
            connectionTest: testResult
        });
    } catch (error) {
        console.error("Erreur lors du test de Cloudinary:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
            details: error
        }, { status: 500 });
    }
}
