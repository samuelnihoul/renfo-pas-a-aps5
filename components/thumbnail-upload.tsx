import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, AlertCircle, Image as ImageIcon, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { upload } from "@vercel/blob/client";

interface ThumbnailUploadProps {
    thumbnailUrl: string | null | undefined;
    onThumbnailChange: (file: File | null) => void;
    onThumbnailUrlChange: (url: string) => void;
    inputId?: string;
}

export default function ThumbnailUpload({
    thumbnailUrl,
    onThumbnailChange,
    onThumbnailUrlChange,
    inputId,
}: ThumbnailUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [uploadError, setUploadError] = useState<string>("");
    const [currentFile, setCurrentFile] = useState<File | null>(null);

    useEffect(() => {
        if (thumbnailUrl) {
            setPreviewUrl(thumbnailUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [thumbnailUrl]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setUploadStatus("error");
                setUploadError("Format d'image non supporté. Utilisez JPEG, PNG, WebP ou GIF.");
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setUploadStatus("error");
                setUploadError("L'image ne doit pas dépasser 5 Mo");
                return;
            }

            setCurrentFile(file);
            onThumbnailChange(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setUploadStatus("uploading");
            setUploadProgress(0);
            setUploadError("");
            
            try {
                // Upload to Vercel Blob Storage
                const { url: blobUrl } = await upload(file.name, file, {
                    access: "public",
                    handleUploadUrl: "/api/upload/thumbnail",
                    onUploadProgress: ({ percentage }) => {
                        setUploadProgress(Math.round(percentage));
                    },
                });
                
                setUploadStatus("success");
                setUploadProgress(100);
                onThumbnailUrlChange(blobUrl);
            } catch (err: any) {
                setUploadStatus("error");
                setUploadError(err?.message || "Erreur lors du téléchargement");
                onThumbnailUrlChange("");
            }
        }
    };

    const handleRemoveThumbnail = () => {
        setCurrentFile(null);
        onThumbnailChange(null);
        onThumbnailUrlChange("");
        setPreviewUrl(null);
        setUploadStatus("idle");
        setUploadProgress(0);
        setUploadError("");
    };

    const computedInputId = inputId || "thumbnail-upload";

    return (
        <div className="space-y-2">
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                {previewUrl ? (
                    <div className="w-full">
                        <div className="relative">
                            <img 
                                src={previewUrl} 
                                alt="Aperçu de la miniature"
                                className="w-full h-48 object-cover rounded-md mb-2"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveThumbnail}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                aria-label="Supprimer la miniature"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {uploadStatus === "uploading" && (
                            <div className="mt-2 mb-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span className="text-sm">Téléchargement en cours...</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                            </div>
                        )}

                        {uploadStatus === "success" && (
                            <div className="flex items-center gap-2 mt-2 mb-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">Téléchargement réussi</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center space-y-4 w-full">
                        <div className="flex justify-center">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Ajouter une miniature</p>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, WebP ou GIF (max. 5MB)
                            </p>
                        </div>
                        <div>
                            <Input
                                id={computedInputId}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor={computedInputId}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
                            >
                                Choisir un fichier
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {uploadStatus === "error" && uploadError && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{uploadError}</span>
                </div>
            )}
        </div>
    );
}
