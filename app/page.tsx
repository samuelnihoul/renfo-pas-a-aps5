"use client"
import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ChevronRight, Dumbbell, ListChecks, AlertCircle, HomeIcon, Lock } from "lucide-react"
import { useData } from "@/components/data-provider"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

// ======================
// TYPE DEFINITIONS
// ======================
type Exercise = {
  id: number;
  name: string;
  videoPublicId: string | null;
  thumbnailUrl: string | null;
  short: string | null;
  instructions: string | null;
  objectifs: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Block = {
  id: number;
  name: string;
  instructions: string;
  focus: string;
  exerciceId: number[];
  exerciseNotes: string[];
  createdAt: string;
  updatedAt: string;
};

type Routine = {
  id: number;
  name: string;
  blockId: number[];
  equipment?: string | null;
  instructions?: string | null;
  sessionOutcome?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Program = {
  id: number;
  name: string;
  description?: string;
  shopDescription?: string | null;
  routineId: number[];
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
};

// ======================
// ERROR ALERT COMPONENT
// ======================
function ErrorAlert() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  if (!error) return null;
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {error === 'AccessDenied'
          ? 'Vous devez être connecté pour accéder à cette page.'
          : 'Une erreur est survenue. Veuillez réessayer.'}
      </AlertDescription>
    </Alert>
  );
}

// ======================
// MAIN PAGE COMPONENT
// ======================
export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [purchasedPrograms, setPurchasedPrograms] = useState<Program[]>([]);
  const [currentLevel, setCurrentLevel] = useState<'programs' | 'routines' | 'blocks'>('programs');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [programRoutines, setProgramRoutines] = useState<Record<number, Routine[]>>({});
  const [loadingStates, setLoadingStates] = useState({
    routines: true,
  });
  const [purchasedLoading, setPurchasedLoading] = useState(true);

  const {
    programs,
    blocks,
    exercises,
    loading,
    error,
    fetchRoutinesByProgram,
  } = useData();
// Ajoutez ce useEffect dans le composant Home, avec les autres hooks
useEffect(() => {
  // Faire défiler vers le haut à chaque changement de niveau
  window.scrollTo(0, 0);
}, [currentLevel]);
  // Fetch purchased programs
  useEffect(() => {
    const fetchPurchasedPrograms = async () => {
      if (!isAuthenticated || !user) {
        setPurchasedLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/programs/purchased');
        if (!response.ok) throw new Error('Failed to fetch purchased programs');
        const data = await response.json();
        setPurchasedPrograms(data.map((item: any) => item.program));
      } catch (error) {
        console.error('Error fetching purchased programs:', error);
      } finally {
        setPurchasedLoading(false);
      }
    };

    fetchPurchasedPrograms();
  }, [isAuthenticated, user]);

  // Reset routines loading when no purchases
  useEffect(() => {
    if (!purchasedLoading && purchasedPrograms.length === 0) {
      setProgramRoutines({});
      setLoadingStates(prev => ({ ...prev, routines: false }));
    }
  }, [purchasedLoading, purchasedPrograms.length]);

  // Load routines for purchased programs
  useEffect(() => {
    const loadRoutinesForPurchasedPrograms = async () => {
      if (purchasedLoading || purchasedPrograms.length === 0) return;

      setLoadingStates(prev => ({ ...prev, routines: true }));
      try {
        const routinesMap: Record<number, Routine[]> = {};
        
        await Promise.all(purchasedPrograms.map(async (program) => {
          const programRoutines = await fetchRoutinesByProgram(program.id);
          routinesMap[program.id] = programRoutines;
        }));
        
        setProgramRoutines(routinesMap);
      } catch (error) {
        console.error("Error loading routines:", error);
      } finally {
        setLoadingStates(prev => ({ ...prev, routines: false }));
      }
    };

    loadRoutinesForPurchasedPrograms();
  }, [purchasedPrograms, purchasedLoading, fetchRoutinesByProgram]);

  // Reset selection if program is no longer available
  useEffect(() => {
    if (selectedProgram && !purchasedPrograms.some(program => program.id === selectedProgram.id)) {
      setCurrentLevel('programs');
      setSelectedProgram(null);
      setSelectedRoutine(null);
    }
  }, [purchasedPrograms, selectedProgram]);

  if (loading || authLoading || purchasedLoading || (purchasedPrograms.length > 0 && loadingStates.routines)) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-screen">
        <p>Chargement de vos programmes...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container px-4 py-8 mx-auto flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-2xl font-bold mb-4">Accès aux Programmes</h1>
        <p className="mb-6 text-muted-foreground">Connectez-vous pour accéder à vos programmes d'entraînement</p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/auth/signin">Se connecter</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/signup">Créer un compte</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-screen">
        <p className="text-red-500">Erreur: {error}</p>
      </div>
    );
  }

  // Navigation functions
  const navigateToProgram = (program: Program) => {
    setSelectedProgram(program);
    setCurrentLevel('routines');
    setSelectedRoutine(null);
  };

  const navigateToRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setCurrentLevel('blocks');
  };

  const goBackToPrograms = () => {
    setCurrentLevel('programs');
    setSelectedProgram(null);
    setSelectedRoutine(null);
  };

  const goBackToRoutines = () => {
    setCurrentLevel('routines');
    setSelectedRoutine(null);
  };

  return (
    <div className="container px-0 py-4 sm:py-6 mx-auto">
      <Suspense fallback={null}>
        <ErrorAlert />
      </Suspense>

      {/* Horizontal Tree Hierarchy Navigation */}
      <div className="mb-6 px-1">
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <button
            onClick={goBackToPrograms}
            className={`px-3 py-1 rounded transition-colors ${currentLevel === 'programs'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'hover:bg-gray-200'}`}
          >
            <HomeIcon className="w-4 h-4" />
          </button>
          {selectedProgram && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                onClick={goBackToRoutines}
                className={`px-3 py-1 rounded transition-colors ${currentLevel === 'routines'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'hover:bg-gray-200'}`}
              >
                {selectedProgram.name}
              </button>
            </>
          )}
          {selectedRoutine && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                {selectedRoutine.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Programs Level */}
      {currentLevel === 'programs' && (
        purchasedPrograms.length === 0 ? (
          <div className="text-center py-12">
            <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun programme acheté</h3>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore accès à de programmes. Parcourez notre catalogue pour en découvrir plus.
            </p>
            <Button asChild>
              <Link href="/programmes">Boutique de programmes</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {purchasedPrograms.map((program) => (
              <Card
                key={program.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigateToProgram(program)}
              >
                <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">{program.name}</h2>
                    </div>
                    <div className="text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full border">
                      {programRoutines[program.id]?.length ?? 0} routines
                    </div>
                  </div>
                  {(program.shopDescription || program.description) && (
                    <p className="text-sm text-gray-600 mt-2 ml-8">
                      {program.shopDescription || program.description}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Routines Level */}
      {currentLevel === 'routines' && selectedProgram && (
        <div className="grid gap-4">
          {(() => {
            const routinesList = programRoutines[selectedProgram.id] || [];
            
            // Si aucune routine, retourner vide
            if (routinesList.length === 0) {
              return null;
            }
            
            // Récupérer le programme complet depuis le contexte pour avoir routineId
            const fullProgram = programs.find(p => p.id === selectedProgram.id);
            const routineIdOrder = fullProgram?.routineId;
            
            // Si routineIdOrder existe et n'est pas vide, trier selon l'ordre
            let routinesToDisplay = routinesList;
            
            if (routineIdOrder && routineIdOrder.length > 0) {
              // Créer un Map pour un accès rapide aux routines par ID
              const routinesMap = new Map(
                routinesList.map(routine => [routine.id, routine])
              );
              
              // Créer la liste des routines dans le même ordre que routineIdOrder
              const orderedRoutines = routineIdOrder
                .map(id => routinesMap.get(id))
                .filter((routine): routine is Routine => routine !== undefined);
              
              // Si on a des routines ordonnées, les utiliser, sinon fallback sur la liste originale
              if (orderedRoutines.length > 0) {
                routinesToDisplay = orderedRoutines;
              }
            }
            
            return routinesToDisplay.map((routine) => (
              <Card
                key={routine.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigateToRoutine(routine)}
              >
                <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">{routine.name}</h2>
                    </div>
                    <div className="text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full border">
                      {routine.blockId.length} blocs
                    </div>
                  </div>
                  {routine.equipment && (
                    <p className="text-sm text-gray-600 mt-2 ml-8">Matériel: {routine.equipment}</p>
                  )}
                  {routine.instructions && (
                    <div className="text-sm text-gray-600 mt-2 ml-8 whitespace-pre-wrap">
                      Instructions: {routine.instructions}
                    </div>
                  )}
                </div>
              </Card>
            ));
          })()}
        </div>
      )}

      {/* Blocks Level */}
      {currentLevel === 'blocks' && selectedRoutine && (
        <div className="space-y-6">
          {/* Regular Blocks */}
          {(() => {
            // Créer un Map pour un accès rapide aux blocks par ID
            const blocksMap = new Map(blocks.map(block => [block.id, block]));
            
            // Créer la liste des blocks dans le même ordre que selectedRoutine.blockId
            const orderedBlocks = (selectedRoutine.blockId || [])
              .map(id => blocksMap.get(id))
              .filter((block): block is Block => block !== undefined);
            
            return orderedBlocks.map((block) => (
              <Card
                key={block.id}
                className={`p-4 sm:p-5 ${block.name.includes('Activation') ? 'bg-gradient-to-r from-blue-400 to-blue-800 text-white' :
                  block.name.includes('Mobilité') ? 'bg-gradient-to-r from-green-400 to-green-800 text-white' :
                    block.name.includes('Développement') ? 'bg-gradient-to-r from-orange-400 to-orange-800 text-white' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ListChecks className="w-5 h-5" />
                    <h3 className="text-lg font-bold">{block.name}</h3>
                  </div>
                </div>
                {block.instructions && (
                  <p className="text-sm mt-2 pb-3">{block.instructions}</p>
                )}
                <div className="space-y-2 ml-1 text-black bg-white rounded-xl">
                  {(() => {
                    // Filtrer les exercices qui appartiennent à ce block
                    const blockExercises = exercises.filter(ex => block.exerciceId?.includes(ex.id) || false);
                    
                    // Si aucun exercice, retourner vide
                    if (blockExercises.length === 0) {
                      return null;
                    }
                    
                    // Si block.exerciceId existe et n'est pas vide, trier selon l'ordre
                    let exercisesToDisplay = blockExercises;
                    
                    if (block.exerciceId && block.exerciceId.length > 0) {
                      // Créer un Map pour un accès rapide aux exercices par ID
                      const exercisesMap = new Map(blockExercises.map(ex => [ex.id, ex]));
                      
                      // Créer la liste des exercices dans le même ordre que block.exerciceId
                      const orderedExercises = block.exerciceId
                        .map(id => exercisesMap.get(id))
                        .filter((ex): ex is Exercise => ex !== undefined);
                      
                      // Si on a des exercices ordonnés, les utiliser, sinon fallback sur la liste originale
                      if (orderedExercises.length > 0) {
                        exercisesToDisplay = orderedExercises;
                      }
                    }
                    
                    return exercisesToDisplay.map((exercise, idx) => (
                      <div
                        key={`${block.id}-${exercise.id}`}
                        className="flex items-start p-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        {exercise.thumbnailUrl || exercise.short ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden mr-3 focus:outline-none group">
                                {exercise.thumbnailUrl ? (
                                  <img
                                    src={exercise.thumbnailUrl}
                                    alt={exercise.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <video
                                    src={exercise.short!}
                                    className="w-full h-full object-cover"
                                    muted
                                    preload="metadata"
                                    poster="/placeholder.svg"
                                    onLoadedMetadata={(e) => {
                                      const video = e.target as HTMLVideoElement;
                                      video.currentTime = 1.1;
                                      video.onloadeddata = () => {
                                        video.pause();
                                      };
                                    }}
                                  />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.06v7.882a1 1 0 001.234.97l6.518-1.857A1 1 0 0016 14.06V9.94a1 1 0 00-1.248-.772z" />
                                  </svg>
                                </div>
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl w-full">
                              <DialogTitle>
                                <span className="sr-only">{exercise.name}</span>
                              </DialogTitle>
                              <div className="w-full aspect-video">
                                {exercise.short ? (
                                  <video
                                    src={exercise.short}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-contain rounded"
                                    poster={exercise.thumbnailUrl || "/placeholder.svg"}
                                  />
                                ) : (
                                  <img
                                    src={exercise.thumbnailUrl}
                                    alt={exercise.name}
                                    className="w-full h-full object-contain rounded"
                                  />
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="w-12 h-12 flex-shrink-0 mr-3 rounded bg-gray-100 flex items-center justify-center">
                            <Dumbbell className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium">{exercise.name}</h4>
                          {block.exerciseNotes?.[idx] && (
                            <p className="text-xs mt-1">
                              {block.exerciseNotes[idx]}
                            </p>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </Card>
            ));
          })()}
          
          {/* Sortie de Séance Block */}
          {selectedRoutine?.sessionOutcome && (
            <Card className="bg-gray-100 border-gray-200">
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-800">Sortie de séance</h3>
                </div>
                <p className="mt-2 text-gray-700">{selectedRoutine.sessionOutcome}</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

