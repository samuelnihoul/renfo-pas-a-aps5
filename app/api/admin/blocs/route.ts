import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blocks, exercises } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate the incoming data
    if (!data.exerciceId || !data.orderIndex || !Array.isArray(data.exercises)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
        const newBlock = await db.insert(blocks).values({
          exerciceId: data.exerciceId,
            sets:data.sets,
          restTime: data.restTime || null,
          orderIndex: data.orderIndex,
          focus:data.focus
        }).returning()




    return NextResponse.json(newBlock, { status: 201 });
  } catch (error) {
    console.error('Error creating bloc:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
