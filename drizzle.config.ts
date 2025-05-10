import type { Config } from "drizzle-kit"
import * as dotenv from "dotenv"

dotenv.config()

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    connectionString: process.env.DATABASE_URL!,
  },
  driver: "d1",
} satisfies Config
