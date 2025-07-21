import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blocks, BlockAdd } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const data: BlockAdd = await request.json();

    // Validate the incoming data
    if (!data.exerciceId || !Array.isArray(data.exerciceId)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!data.exerciseNotes || !Array.isArray(data.exerciseNotes) || data.exerciseNotes.length !== data.exerciceId.length) {
      return NextResponse.json({ error: 'exerciseNotes must be an array of the same length as exerciceId' }, { status: 400 });
    }
    const newBlock = await db.insert(blocks).values({
      exerciceId: data.exerciceId,
      exerciseNotes: data.exerciseNotes,
      instructions: data.instructions,
      focus: data.focus,
      name: data.name
    }).returning()




    return NextResponse.json(newBlock, { status: 201 });
  } catch (error) {
    console.error('Error creating bloc:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}