"use server"

import { NextResponse } from "next/server";
import * as fs from 'fs';
import * as path from 'path';

// Define the directory where videos will be stored
const VIDEOS_DIR = path.join(process.cwd(), 'public', 'videos');

export async function GET() {
    try {
        // Check if the videos directory exists
        const dirExists = fs.existsSync(VIDEOS_DIR);
        
        // If it doesn't exist, try to create it
        if (!dirExists) {
            try {
                fs.mkdirSync(VIDEOS_DIR, { recursive: true });
                console.log("Created videos directory:", VIDEOS_DIR);
            } catch (mkdirError) {
                return NextResponse.json({
                    success: false,
                    error: "Failed to create videos directory",
                    details: mkdirError instanceof Error ? mkdirError.message : "Unknown error"
                }, { status: 500 });
            }
        }
        
        // Check if the directory is writable
        let isWritable = false;
        try {
            // Try to write a temporary file
            const testFile = path.join(VIDEOS_DIR, '.test-write');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            isWritable = true;
        } catch (writeError) {
            return NextResponse.json({
                success: false,
                error: "Videos directory is not writable",
                details: writeError instanceof Error ? writeError.message : "Unknown error"
            }, { status: 500 });
        }
        
        // Get the list of files in the directory
        const files = fs.readdirSync(VIDEOS_DIR);
        
        return NextResponse.json({
            success: true,
            storageStatus: {
                directory: VIDEOS_DIR,
                exists: dirExists,
                isWritable,
                fileCount: files.length
            }
        });
    } catch (error) {
        console.error("Error testing local file storage:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            details: error
        }, { status: 500 });
    }
}