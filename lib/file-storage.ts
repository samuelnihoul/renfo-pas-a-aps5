import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define the directory where videos will be stored
const VIDEOS_DIR = path.join(process.cwd(), 'public', 'videos');

// Ensure the videos directory exists
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

/**
 * Upload a video file to the local filesystem
 * @param file The video file as ArrayBuffer
 * @returns Object containing the URL and ID of the uploaded video
 */
export async function uploadVideo(file: ArrayBuffer): Promise<{ url: string; publicId: string }> {
  try {
    // Generate a unique filename using UUID
    const filename = `${uuidv4()}.mp4`;
    const filePath = path.join(VIDEOS_DIR, filename);
    
    // Write the file to disk
    fs.writeFileSync(filePath, Buffer.from(file));
    
    // Return the URL (relative to the public directory) and the filename as publicId
    return {
      url: `/videos/${filename}`,
      publicId: filename
    };
  } catch (error) {
    console.error('Error uploading video to filesystem:', error);
    throw new Error('Failed to upload video to filesystem');
  }
}

/**
 * Delete a video from the local filesystem
 * @param publicId The filename of the video to delete
 * @returns Boolean indicating success or failure
 */
export async function deleteVideo(publicId: string): Promise<boolean> {
  try {
    const filePath = path.join(VIDEOS_DIR, publicId);
    
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Delete the file
      fs.unlinkSync(filePath);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting video from filesystem:', error);
    return false;
  }
}