import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blocks, exercises } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate the incoming data
    if (!data.routinesId || !data.exercises || !Array.isArray(data.exercises)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert the exercise blocks into the database and create associated exercises
    const insertedBlocksWithExercises = await Promise.all(
      data.exercises.map(async (exerciseData: any, index: number) => {
        // Create the block first
        const [newBlock] = await db.insert(blocks).values({
          routinesId: data.routinesId,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          restTime: exerciseData.restTime || null,
          orderIndex: index
        }).returning();

        // Then create the associated exercise with reference to the block
        const [newExercise] = await db.insert(exercises).values({
          name: exerciseData.name,
          videoUrl: exerciseData.videoUrl || null,
          videoPublicId: exerciseData.videoPublicId || null,
          instructions: exerciseData.instructions || null,
          tempsReps: exerciseData.tempsReps || null,
          blockId: newBlock.id
        }).returning();

        return {
          block: newBlock,
          exercise: newExercise
        };
      })
    );

    return NextResponse.json(insertedBlocksWithExercises, { status: 201 });
  } catch (error) {
    console.error('Error creating bloc:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
