import { NextResponse } from 'next/server'
import { db } from '@/db'
import { exercises } from '@/db/schema'
import { ilike, or, sql } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''

  if (!query) {
    return NextResponse.json([])
  }

  try {
    const searchTerm = `%${query}%`
    
    const results = await db
      .select()
      .from(exercises)
      .where(
        or(
          ilike(exercises.name, searchTerm),
        )
      )
      .limit(10)
      .execute()

    // Transform the results to match the expected format
    const formattedResults = results.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      description: exercise.notes || '',
      instructions: exercise.instructions || '',
      difficulty: 'Tous niveaux', // Default value since we don't have this field
      muscleGroup: exercise.muscleGroup || 'Non spécifié',
      videoUrl: exercise.videoPublicId || undefined,
      imageUrl: undefined,
      createdAt: exercise.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: exercise.updatedAt?.toISOString() || new Date().toISOString()
    }))

    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
