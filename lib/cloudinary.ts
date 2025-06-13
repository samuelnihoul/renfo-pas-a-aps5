
import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary avec les variables d'environnement
cloudinary.config({
    secure: true,
});

// La fonction principale pour télécharger une vidéo sur Cloudinary
export async function uploadVideo(file: ArrayBuffer): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
        // Création d'un stream à partir du buffer
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video',
                folder: 'exercise-videos',
                // Options pour optimiser les vidéos
                eager: [
                    { raw_transformation: 'q_auto:low', format: 'mp4' }
                ],
                eager_async: true,
                // Ajout d'un tag pour faciliter le management
                tags: ['exercise']
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error('Echec du téléchargement: aucun résultat retourné'));
                }

                return resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        );

        // Conversion du ArrayBuffer en string base64 (requis par Cloudinary)
        const buffer = Buffer.from(file);
        const base64 = buffer.toString('base64');
        const dataURI = `data:video/mp4;base64,${base64}`;

        // Upload du fichier en tant que data URI
        stream.end(dataURI);
    });
}

// Fonction pour supprimer une vidéo de Cloudinary
export async function deleteVideo(publicId: string): Promise<boolean> {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        return result.result === 'ok';
    } catch (error) {
        console.error('Erreur lors de la suppression de la vidéo:', error);
        return false;
    }
}
