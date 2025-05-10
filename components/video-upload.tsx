import React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VideoUploadProps {
    videoUrl: string | null;
    onVideoChange: (file: File | null) => void;
    onVideoUrlChange: (url: string) => void;
}

export default function VideoUpload({ videoUrl, onVideoChange, onVideoUrlChange }: VideoUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Set initial preview from videoUrl prop
    useEffect(() => {
        if (videoUrl) {
            setPreviewUrl(videoUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [videoUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onVideoChange(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleRemoveVideo = () => {
        onVideoChange(null);
        onVideoUrlChange("");
        setPreviewUrl(null);
    };

    return (
        <div className="space-y-2">
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                {previewUrl ? (
                    <div className="w-full">
                        <video src={previewUrl} controls className="w-full h-48 object-cover rounded-md mb-2" />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveVideo}
                        >
                            Supprimer la vidéo
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-muted-foreground mb-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <p className="text-sm text-muted-foreground mb-2">
                                Glissez-déposez ou cliquez pour sélectionner une vidéo
                            </p>
                            <Input
                                id="video-upload"
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    document.getElementById("video-upload")?.click();
                                }}
                            >
                                Sélectionner un fichier
                            </Button>
                        </div>
                    </>
                )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
                Formats acceptés: MP4, WebM. Taille maximale: 50MB
            </p>
        </div>
    );
}
