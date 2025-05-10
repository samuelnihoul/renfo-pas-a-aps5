"use server"

import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

// Taille maximale de fichier (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const videoFile = formData.get("video") as File | null;

        if (!videoFile) {
            return NextResponse.json(
                { error: "Aucun fichier vidéo fourni" },
                { status: 400 }
            );
        }

        // Vérifier le type de fichier (accepter uniquement mp4 et webm)
        const fileType = videoFile.type;
        if (!["video/mp4", "video/webm"].includes(fileType)) {
            return NextResponse.json(
                { error: "Type de fichier non pris en charge. Veuillez télécharger un fichier MP4 ou WebM." },
                { status: 400 }
            );
        }

        // Vérifier la taille du fichier
        if (videoFile.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "Le fichier est trop volumineux. Taille maximale autorisée: 50MB." },
                { status: 400 }
            );
        }

        // Générer un nom de fichier unique
        const fileName = `${uuidv4()}.${fileType === "video/mp4" ? "mp4" : "webm"}`;

        // Créer le répertoire de stockage s'il n'existe pas déjà
        const uploadDir = join(process.cwd(), "public", "videos");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.error("Erreur lors de la création du répertoire:", error);
        }

        // Chemin du fichier
        const filePath = join(uploadDir, fileName);

        // Convertir le fichier en tableau d'octets
        const bytes = await videoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Écrire le fichier sur le disque
        await writeFile(filePath, buffer);

        // URL publique du fichier
        const fileUrl = `/videos/${fileName}`;

        return NextResponse.json({ success: true, fileUrl });
    } catch (error) {
        console.error("Erreur lors du téléchargement du fichier:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue lors du téléchargement du fichier" },
            { status: 500 }
        );
    }
}
