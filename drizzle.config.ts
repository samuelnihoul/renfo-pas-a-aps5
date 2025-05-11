import type { Config } from "drizzle-kit"
import * as dotenv from "dotenv"

dotenv.config()

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  driver: "pg",
} satisfies Config
