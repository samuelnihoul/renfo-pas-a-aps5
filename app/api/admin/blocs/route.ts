import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blocks, exercises } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate the incoming data
    if (!data.routinesId || !data.exercises || !Array.isArray(data.exercises)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert the exercise blocks into the database and associate with existing exercises
    const insertedBlocksWithExercises = await Promise.all(
      data.exercises.map(async (exerciseData: any, index: number) => {
        // Verify that the exercise exists
        const exercise = await db.query.exercises.findFirst({
          where: eq(exercises.id, exerciseData.exerciseId)
        });

        if (!exercise) {
          throw new Error(`Exercise with ID ${exerciseData.exerciseId} not found`);
        }

        // Create the block first
        const [newBlock] = await db.insert(blocks).values({
          routinesId: data.routinesId,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          restTime: exerciseData.restTime || null,
          orderIndex: index
        }).returning();



        return {
          block: newBlock,
          exercise: exercise
        };
      })
    );

    return NextResponse.json(insertedBlocksWithExercises, { status: 201 });
  } catch (error) {
    console.error('Error creating bloc:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
