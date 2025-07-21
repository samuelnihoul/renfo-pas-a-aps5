//app/api/admin/blocs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blocks, BlockAdd } from '@/db/schema';
import { eq } from 'drizzle-orm';

// DELETE route
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const awaitedParams = await params;
    try {
        const { id } = awaitedParams;

        if (!id) {
            return NextResponse.json({ error: 'Missing block ID' }, { status: 400 });
        }

        // Delete the block with the specified ID
        const result = await db.delete(blocks).where(eq(blocks.id, Number(id))).returning();

        if (result.length === 0) {
            return NextResponse.json({ error: 'Block not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Block deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting block:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT route
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const awaitedParams = await params;
    try {
        const { id } = awaitedParams;
        const data: BlockAdd = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing block ID' }, { status: 400 });
        }

        // Validate the incoming data
        if (!data.exerciceId || !Array.isArray(data.exerciceId)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Update the block with the specified ID
        const updatedBlock = await db.update(blocks).set({
            exerciceId: data.exerciceId,
            instructions: data.instructions,
            focus: data.focus,
            name: data.name
        }).where(eq(blocks.id, Number(id))).returning();

        if (updatedBlock.length === 0) {
            return NextResponse.json({ error: 'Block not found' }, { status: 404 });
        }

        return NextResponse.json(updatedBlock[0], { status: 200 });
    } catch (error) {
        console.error('Error updating block:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
