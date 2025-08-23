// This file is intentionally left minimal as the auth configuration
// is now handled in @/lib/auth.ts
// This is the recommended approach for Next.js 13+ with App Router

import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
export const runtime = 'nodejs' // Optional: helps with cold starts in serverless environments 