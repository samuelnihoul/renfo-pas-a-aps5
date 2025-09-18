import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';



export async function POST(request: Request): Promise<Response> {
    
    try {
        const body = (await request.json()) as HandleUploadBody;
        
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                // Only allow mp4 and mov, max 10GB
                return {
                    allowedContentTypes: ['video/mp4', 'video/mov'],
                    addRandomSuffix: true,
		    multipart:true
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Optionally: update your DB here
                console.log('Upload completed:', blob);
            },
        });
        
        return new NextResponse(JSON.stringify(jsonResponse), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
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
