# Self-Hosted Video Implementation

This document describes the implementation of self-hosted videos in the Renfo Pas à Pas application.

## Overview

Previously, the application used Cloudinary for video hosting. The implementation has been changed to use self-hosted videos stored in the local filesystem. This change was made to reduce dependency on external services and to have more control over the video hosting infrastructure.

## Implementation Details

### Storage Location

Videos are stored in the `public/videos` directory of the application. This directory is served statically by Next.js, making the videos accessible via URLs like `/videos/filename.mp4`.

### File Naming

Video files are named using UUIDs to ensure uniqueness. The format is `{uuid}.mp4`.

### Database Schema

The database schema remains unchanged. Videos are still referenced in the database using two fields:
- `videoUrl`: The URL of the video (now a local path like `/videos/filename.mp4`)
- `videoPublicId`: The ID of the video (now the filename)

### API Endpoints

The following API endpoints have been updated to use the local filesystem implementation:

1. `POST /api/upload/video`: Uploads a video to the local filesystem
2. `DELETE /api/admin/exercises/[id]`: Deletes a video from the local filesystem when an exercise is deleted

A new test endpoint has been added:
- `GET /api/test-storage`: Tests the local filesystem implementation

### Implementation Files

- `lib/file-storage.ts`: Contains functions for uploading and deleting videos from the local filesystem
- `app/api/upload/video/route.ts`: API route for uploading videos
- `app/api/admin/exercises/[id]/route.ts`: API route for deleting exercises and their associated videos
- `app/api/test-storage/route.ts`: API route for testing the local filesystem implementation

## Usage

### Uploading Videos

Videos can be uploaded using the existing video upload component. The component sends the video file to the `/api/upload/video` endpoint, which saves the file to the local filesystem and returns the URL and ID of the uploaded video.

### Displaying Videos

Videos are displayed using the HTML `<video>` element with the `src` attribute set to the video URL. This implementation remains unchanged from the previous Cloudinary implementation.

### Deleting Videos

Videos are automatically deleted when an exercise is deleted. This is handled by the `/api/admin/exercises/[id]` endpoint.

## Dependencies

The implementation requires the following dependencies:
- `uuid`: For generating unique filenames
- `@types/uuid`: TypeScript types for the uuid package

These dependencies have been added to the package.json file.

## Testing

The local filesystem implementation can be tested using the `/api/test-storage` endpoint. This endpoint checks if the videos directory exists and is writable, and returns information about the directory.