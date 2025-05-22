import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blocs, blocExercises } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate the incoming data
    if (!data.name || !data.type || !data.difficulty || !data.exercises || !Array.isArray(data.exercises)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert the new bloc into the database
    const [newBloc] = await db.insert(blocs).values({
      name: data.name,
      description: data.description || '',
      type: data.type,
      difficulty: data.difficulty,
      instructions: data.instructions || '',
      videoUrl: data.videoUrl || '',
      videoPublicId: data.videoPublicId || '',
    }).returning();

    // Insert the relationships between the bloc and exercises
    await db.insert(blocExercises).values(
      data.exercises.map((exerciseId: number) => ({
        bloc_id: newBloc.id,
        exercise_id: exerciseId,
      }))
    );

    return NextResponse.json(newBloc, { status: 201 });
  } catch (error) {
    console.error('Error creating bloc:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
