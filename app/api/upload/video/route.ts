import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                // Only allow mp4 and webm, max 50MB
                return {
                    allowedContentTypes: ['video/mp4', 'video/webm'],
                    maximumSizeInBytes: 100000 * 1024 * 1024,
                    addRandomSuffix: true,
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Optionally: update your DB here
            },
        });
        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : String(error) },
            { status: 400 },
        );
    }
}
