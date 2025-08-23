// video-upload
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { upload } from "@vercel/blob/client";

interface VideoUploadProps {
    videoUrl: string | null;
    onVideoChange: (file: File | null) => void;
    onVideoUrlChange: (url: string) => void;
}

export default function VideoUpload({
    videoUrl,
    onVideoChange,
    onVideoUrlChange,
}: VideoUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [uploadError, setUploadError] = useState<string>("");
    const [currentFile, setCurrentFile] = useState<File | null>(null);

    useEffect(() => {
        if (videoUrl) {
            setPreviewUrl(videoUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [videoUrl]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCurrentFile(file);
            onVideoChange(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setUploadStatus("uploading");
            setUploadProgress(0);
            setUploadError("");
            try {
                // Upload to Vercel Blob Storage
                const { url: blobUrl } = await upload(file.name, file, {
                    access: "public",
                    handleUploadUrl: "/api/upload/video",
                    onUploadProgress: ({ percentage }) => {
                        setUploadProgress(Math.round(percentage));
                    },
                    multipart:true,
                });
                setUploadStatus("success");
                setUploadProgress(100);
                onVideoUrlChange(blobUrl);
            } catch (err: any) {
                setUploadStatus("error");
                setUploadError(err?.message || "Erreur lors du téléchargement");
                onVideoUrlChange("");
            }
        }
    };

    const handleRemoveVideo = () => {
        setCurrentFile(null);
        onVideoChange(null);
        onVideoUrlChange("");
        setPreviewUrl(null);
        setUploadStatus("idle");
        setUploadProgress(0);
        setUploadError("");
    };

    return (
        <div className="space-y-2">
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                {previewUrl ? (
                    <div className="w-full">
                        <video src={previewUrl} controls className="w-full h-48 object-cover rounded-md mb-2" />

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

                        {uploadStatus === "error" && (
                            <div className="flex items-center gap-2 mt-2 mb-2 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{uploadError || "Erreur lors du téléchargement"}</span>
                            </div>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveVideo}
                            disabled={uploadStatus === "uploading"}
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
        </div>
    );
}
