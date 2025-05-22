'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import VideoUpload from "@/components/video-upload";

export default function NewBlocPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    difficulty: "Débutant",
    instructions: "",
    videoUrl: "",
    videoPublicId: "",
    exercises: [] as number[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exercises, setExercises] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    // Fetch the list of exercises from the API
    const fetchExercises = async () => {
      try {
        const response = await fetch("/api/exercises");
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    fetchExercises();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleExerciseChange = (exerciseId: number) => {
    setFormData((prev) => {
      const exercises = prev.exercises.includes(exerciseId)
        ? prev.exercises.filter((id) => id !== exerciseId)
        : [...prev.exercises, exerciseId];
      return { ...prev, exercises };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setVideoFile(file);
      const fileURL = URL.createObjectURL(file);
      setPreviewUrl(fileURL);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom du bloc est requis";
    }

    if (!formData.type) {
      newErrors.type = "Le type de bloc est requis";
    }

    if (!formData.difficulty) {
      newErrors.difficulty = "La difficulté est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let finalVideoUrl = formData.videoUrl;
      if (videoFile) {
        toast({
          title: "Téléchargement en cours",
          description: `Envoi de '${videoFile.name}' vers le serveur...`,
        });

        const uploadFormData = new FormData();
        uploadFormData.append("video", videoFile);

        const uploadResponse = await fetch("/api/upload/video", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          toast({
            title: "Échec du téléchargement",
            description: errorData.error || "La vidéo n'a pas pu être téléchargée",
            variant: "destructive",
          });
          throw new Error(errorData.error || "Erreur lors du téléchargement de la vidéo");
        }

        const uploadData = await uploadResponse.json();
        finalVideoUrl = uploadData.fileUrl;
        const videoPublicId = uploadData.publicId;

        toast({
          title: "Téléchargement réussi",
          description: "La vidéo a été téléchargée avec succès",
        });

        formData.videoPublicId = videoPublicId;
      }

      const response = await fetch("/api/admin/blocs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          videoUrl: finalVideoUrl,
        }),
      });

      if (response.ok) {
        toast({
          title: "Bloc créé",
          description: "Le bloc a été créé avec succès",
        });
        router.push("/admin/blocs");
      } else {
        const data = await response.json();
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue lors de la création du bloc",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating bloc:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création du bloc",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const blocTypes = [
    "Cardio",
    "Force",
    "Flexibilité",
    "Endurance",
    "Équilibre",
  ];

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin/blocs">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-2">Nouveau bloc</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informations du bloc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                Nom du bloc*
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Description du bloc..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className={errors.type ? "text-destructive" : ""}>
                  Type de bloc*
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-destructive text-sm">{errors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty" className={errors.difficulty ? "text-destructive" : ""}>
                  Difficulté*
                </Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleSelectChange("difficulty", value)}>
                  <SelectTrigger className={errors.difficulty ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Avancé">Avancé</SelectItem>
                  </SelectContent>
                </Select>
                {errors.difficulty && <p className="text-destructive text-sm">{errors.difficulty}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                placeholder="Instructions détaillées pour réaliser le bloc..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video">Vidéo de démonstration</Label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                {previewUrl ? (
                  <div className="w-full">
                    <video src={previewUrl} controls className="w-full h-48 object-cover rounded-md mb-2" />
                    <div className="flex items-center gap-2 my-2 text-sm">
                      <Upload className="h-4 w-4 text-primary" />
                      <span className="font-medium text-gray-700">
                        {videoFile?.name} ({videoFile ? Math.round(videoFile.size / 1024) : 0}KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setVideoFile(null);
                        setPreviewUrl(null);
                        setFormData((prev) => ({
                          ...prev,
                          videoUrl: "",
                        }));
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Glissez-déposez ou cliquez pour sélectionner une vidéo
                    </p>
                    <Input id="video" type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        document.getElementById("video")?.click();
                      }}
                    >
                      Sélectionner un fichier
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Formats acceptés: MP4, WebM. Taille maximale: 50MB</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL de la vidéo (alternative)</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://exemple.com/video.mp4"
                disabled={!!previewUrl}
              />
              <p className="text-xs text-muted-foreground">
                Si vous n'avez pas de fichier à télécharger, vous pouvez fournir une URL directe vers une vidéo.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercises">Exercices</Label>
              <div className="space-y-1">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`exercise-${exercise.id}`}
                      checked={formData.exercises.includes(exercise.id)}
                      onChange={() => handleExerciseChange(exercise.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`exercise-${exercise.id}`}>{exercise.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">* Champs obligatoires</p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link href="/admin/blocs">
              <Button variant="outline" type="button">
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le bloc"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
