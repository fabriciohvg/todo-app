// THE FOLLOWING CODE IS THE INSTRUCTION ON THE TUTORIAL PAGE
// IN https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon
// TITLE:
// "Todo App with Neon Postgres"

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

config({ path: ".env" }); // or .env.local

export const db = drizzle(process.env.DATABASE_URL!);
