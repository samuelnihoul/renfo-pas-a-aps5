"use client"
import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ChevronRight, Dumbbell, ListChecks, AlertCircle, HomeIcon } from "lucide-react"
import { useData } from "@/components/data-provider"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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
  sessionOutcome?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Program = {
  id: number;
  name: string;
  description?: string;
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
  const [currentLevel, setCurrentLevel] = useState<'programs' | 'routines' | 'blocks'>('programs');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [programRoutines, setProgramRoutines] = useState<Record<number, Routine[]>>({});
  const [loadingStates, setLoadingStates] = useState({
    programs: true,
    routines: true,
    blocks: true,
  });

  const {
    programs,
    routines,
    blocks,
    exercises,
    loading,
    error,
    fetchRoutinesByProgram,
  } = useData();

  // ======================
  // SIDE EFFECTS
  // ======================
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (programs.length > 0) {
          setLoadingStates(prev => ({ ...prev, routines: true }));
          const routinesMap: Record<number, Routine[]> = {};
          await Promise.all(programs.map(async (program) => {
            const programRoutines = await fetchRoutinesByProgram(program.id);
            routinesMap[program.id] = programRoutines;
          }));
          setProgramRoutines(routinesMap);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoadingStates(prev => ({ ...prev, routines: false }));
      }
    };
    loadInitialData();
  }, [programs, fetchRoutinesByProgram]);

  if (loading || loadingStates.routines) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-screen">
        <p>Chargement des données...</p>
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
        <div className="grid gap-4">
          {programs.map((program) => (
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
                    {programRoutines[program.id]?.length || 0} routines
                  </div>
                </div>
                {program.description && (
                  <p className="text-sm text-gray-600 mt-2 ml-8">{program.description}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Routines Level */}
      {currentLevel === 'routines' && selectedProgram && (
        <div className="grid gap-4">
          {programRoutines[selectedProgram.id]?.map((routine) => (
            <Card
              key={routine.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigateToRoutine(routine)}
            >
              <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors">
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
                {routine.sessionOutcome && (
                  <p className="text-sm text-gray-600 mt-1 ml-8">Sortie de séance: {routine.sessionOutcome}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Blocks Level */}
      {currentLevel === 'blocks' && selectedRoutine && (
        <div className="space-y-6">
          {blocks
            .filter(block => selectedRoutine.blockId.includes(block.id))
            .map((block) => (
              <Card
                key={block.id}
                className={`p-4 sm:p-5 ${block.name.includes('Activation') ? 'bg-blue-50' :
                  block.name.includes('Mobilité') ? 'bg-green-50' :
                    block.name.includes('Développement') ? 'bg-orange-50' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ListChecks className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-800">{block.name}</h3>
                  </div>
                </div>
                {block.instructions && (
                  <p className="text-sm text-gray-600 mt-2 pb-3">{block.instructions}</p>
                )}
                <div className="space-y-2 ml-1">
                  {exercises
                    .filter(ex => block.exerciceId.includes(ex.id))
                    .map((exercise, idx) => (
                      <div
                        key={`${block.id}-${exercise.id}`}
                        className="flex items-start p-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        {exercise.short ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden mr-3 focus:outline-none group">
                                <video
                                  src={exercise.short}
                                  className="w-full h-full object-cover"
                                  muted
                                  preload="metadata"
                                  poster="/placeholder.svg"
                                  onLoadedMetadata={(e) => {
                                    const video = e.target as HTMLVideoElement;
                                    video.currentTime = 0.1;
                                    video.onloadeddata = () => {
                                      video.pause();
                                    };
                                  }}
                                />
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
                                <video
                                  src={exercise.short}
                                  controls
                                  autoPlay
                                  className="w-full h-full object-contain rounded"
                                  poster="/placeholder.svg"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="w-12 h-12 flex-shrink-0 mr-3 rounded bg-gray-100 flex items-center justify-center">
                            <Dumbbell className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{exercise.name}</h4>
                          {block.exerciseNotes?.[idx] && (
                            <p className="text-xs text-gray-600 mt-1">
                              {block.exerciseNotes[idx]}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
