import { pgTable, integer, text } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";

const users = pgTable("users", {
    id: integer().primaryKey(),
    name: text().notNull(),
});

async function main() {
    const db = drizzle(process.env.DATABASE_URL!);
    await seed(db, { users });
}

main();


