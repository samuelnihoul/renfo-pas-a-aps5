import type { Config } from "drizzle-kit"

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  driver: "pg",
} satisfies Config
