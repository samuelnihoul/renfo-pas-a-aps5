"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Video, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type BlockType = "mobility" | "activation" | "development"

interface Exercise {
  id: string
  name: string
  videoUrl: string
  description: string
  sets: number
  reps: string
  tempo: string
  rest: string
}

interface Block {
  id: string
  type: BlockType
  name: string
  exercises: Exercise[]
}

interface Routine {
  id: string
  name: string
  blocks: Block[]
  equipment: string[]
  sessionOutcome: string
}

export function ProgramView({
  program,
  routine,
  onNextRoutine,
  onPrevRoutine,
  hasNextRoutine,
  hasPrevRoutine,
  onBackToProgram,
}: {
  program: any
  routine: Routine
  onNextRoutine: () => void
  onPrevRoutine: () => void
  hasNextRoutine: boolean
  hasPrevRoutine: boolean
  onBackToProgram: () => void
}) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const blockColors: Record<BlockType, string> = {
    mobility: "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800",
    activation: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
    development: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
  }

  const blockBadgeColors: Record<BlockType, string> = {
    mobility: "bg-purple-500 text-white",
    activation: "bg-blue-500 text-white",
    development: "bg-amber-500 text-white",
  }

  const blockTitles: Record<BlockType, string> = {
    mobility: "MOBILITÉ",
    activation: "ACTIVATION",
    development: "DÉVELOPPEMENT",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBackToProgram} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Retour au programme
        </Button>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onPrevRoutine}
            disabled={!hasPrevRoutine}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          
          <h1 className="text-2xl font-bold text-center">
            {program.name} - {routine.name}
          </h1>
          
          <Button 
            variant="outline" 
            onClick={onNextRoutine}
            disabled={!hasNextRoutine}
            className="flex items-center gap-2"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="w-32"></div> {/* Spacer for alignment */}
      </div>

      {/* Equipment and Session Outcome */}
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Matériel nécessaire :</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {routine.equipment.map((item, index) => (
            <Badge key={index} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
        
        <h3 className="font-medium mb-2">Objectif de la séance :</h3>
        <p className="text-muted-foreground">{routine.sessionOutcome}</p>
      </div>

      <div className="space-y-8">
        {routine.blocks.map((block) => (
          <div key={block.id} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-md font-bold ${blockBadgeColors[block.type]}`}>
                {blockTitles[block.type]}
              </div>
              <h2 className="text-xl font-semibold">{block.name}</h2>
            </div>
            
            <Card className={`border ${blockColors[block.type]}`}>
              <ScrollArea className="h-[calc(100vh-400px)]">
                {block.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Exercise Thumbnail */}
                      <div 
                        className="relative w-32 h-24 rounded-md overflow-hidden cursor-pointer bg-muted flex-shrink-0"
                        onClick={() => {
                          setSelectedExercise(exercise)
                          setIsVideoOpen(true)
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Video className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                          {exercise.reps}
                        </div>
                      </div>
                      
                      {/* Exercise Details */}
                      <div className="flex-1">
                        <h3 className="font-medium">{exercise.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {exercise.description}
                        </p>
                        
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">{exercise.sets} séries</Badge>
                          <Badge variant="outline">Tempo: {exercise.tempo}</Badge>
                          <Badge variant="outline">Repos: {exercise.rest}</Badge>
                        </div>
                      </div>
                      
                      {/* Full Video Button */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1 text-sm"
                        onClick={() => {
                          setSelectedExercise(exercise)
                          setIsVideoOpen(true)
                        }}
                      >
                        <Info className="h-4 w-4" />
                        Voir la démo
                      </Button>
                    </div>
                    
                    {index < block.exercises.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </ScrollArea>
            </Card>
          </div>
        ))}
      </div>

      {/* Exercise Video Modal */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedExercise?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedExercise && (
            <div className="aspect-video bg-black rounded-md overflow-hidden">
              {/* Replace with your video player component */}
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                <div className="text-center">
                  <Video className="h-16 w-16 mx-auto mb-4" />
                  <p>Vidéo de démonstration pour {selectedExercise.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedExercise.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
