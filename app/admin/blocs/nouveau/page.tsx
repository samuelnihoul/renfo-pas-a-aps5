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

export default function NewBlocPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{name:string,type:""|"mobilité"|"activation"|"force",instructions:string,exercises:number[]}>({
    name: "",
    type: "",
    instructions: "",
    exercises: [] as number[],
  });
  const [exercises, setExercises] = useState<{ id: number; name: string }[]>([]);
  const [errors,setErrors] = useState<Record<string, string>>({})
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
      const fileURL = URL.createObjectURL(file);
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
      const response = await fetch("/api/admin/blocs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
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

              <p className="text-xs text-muted-foreground mt-2">Formats acceptés: MP4, WebM. Taille maximale: 50MB</p>
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
