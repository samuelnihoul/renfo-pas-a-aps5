import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blocks, exercises } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate the incoming data
    if (!data.dayId || !data.exercises || !Array.isArray(data.exercises)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert the exercise blocks into the database
    const insertedBlocks = await Promise.all(
      data.exercises.map(async (exercise: any, index: number) => {
        const [newBlock] = await db.insert(blocks).values({
          exerciseId: exercise.exerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          restTime: exercise.restTime || null,
          orderIndex: index
        }).returning();
        return newBlock;
      })
    );

    return NextResponse.json(insertedBlocks, { status: 201 });
  } catch (error) {
    console.error('Error creating bloc:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
