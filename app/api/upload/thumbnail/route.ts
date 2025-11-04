import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<Response> {
    try {
        const body = (await request.json()) as HandleUploadBody;
        
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                // Allow common image formats
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                    maximumSizeInBytes: 5 * 1024 * 1024, // 5MB
                    addRandomSuffix: true,
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('Thumbnail upload completed:', blob);
            },
        });
        
        return new NextResponse(JSON.stringify(jsonResponse), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Thumbnail upload error:', error);
        return new NextResponse(
            JSON.stringify({ 
                error: error instanceof Error ? error.message : 'An unknown error occurred',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            }),
            { 
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}
