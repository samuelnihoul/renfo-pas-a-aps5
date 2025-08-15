import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204, // No Content
    headers: corsHeaders,
  });
}

export async function POST(request: Request): Promise<Response> {
    // Handle preflight for older browsers
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders,
        });
    }

    try {
        const body = (await request.json()) as HandleUploadBody;
        
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                // Only allow mp4 and webm, max 10GB
                return {
                    allowedContentTypes: ['video/mp4', 'video/webm'],
                    maximumSizeInBytes: 10000 * 1024 * 1024, // 100MB
                    addRandomSuffix: true,
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
                ...corsHeaders
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
                    ...corsHeaders
                },
            }
        );
    }
}
