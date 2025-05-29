import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";
import {users,exercises,blocks} from './schema'

async function main() {
    const db = drizzle(process.env.DATABASE_URL!);
    await seed(db, { users, });
}

main();


