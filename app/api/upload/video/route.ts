"use server"

import { NextRequest, NextResponse } from "next/server";
import { uploadVideo } from "@/lib/cloudinary";

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
    }        // Convertir le fichier en ArrayBuffer pour l'upload Cloudinary
    const bytes = await videoFile.arrayBuffer();

    try {
      // Télécharger la vidéo sur Cloudinary
      const result = await uploadVideo(bytes);

      // Retourner l'URL de la vidéo téléchargée
      return NextResponse.json({
        success: true,
        fileUrl: result.url,
        publicId: result.publicId
      });
    } catch (uploadError) {
      console.error("Erreur lors du téléchargement sur Cloudinary:", uploadError);
      return NextResponse.json(
          { error: "Une erreur est survenue lors du téléchargement sur Cloudinary" },
          { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors du téléchargement du fichier:", error);
    return NextResponse.json(
        { error: "Une erreur est survenue lors du téléchargement du fichier" },
        { status: 500 }
    );
  }
}
