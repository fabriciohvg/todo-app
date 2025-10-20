// THE FOLLOWING CODE IS THE INSTRUCTION ON THE TUTORIAL PAGE
// IN https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon
// TITLE:
// "Todo App with Neon Postgres"

// THE FOLLOWING CODE WORKS FINE WITH THE 'GET STARTED'INSTRUCTIONS
// ON THE PAGE https://orm.drizzle.team/docs/get-started/neon-new

/* import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { usersTable } from "./db/schema";

const db = drizzle(neon(process.env.DATABASE_URL!));

async function main() {
  const user: typeof usersTable.$inferInsert = {
    name: "Fabrício",
    email: "fabriciohvg@gmail.com.br",
  };

  await db.insert(usersTable).values(user);
  console.log("New user created!");

  const users = await db.select().from(usersTable);
  console.log("Getting all users from the database: ", users);

  await db
    .update(usersTable)
    .set({
      email: "fabriciohenrique.eng@gmail.com",
    })
    .where(eq(usersTable.email, user.email));
  console.log("User updated!");

  const updatedUsers = await db.select().from(usersTable);
  console.log("Getting all users from the database: ", updatedUsers);

  await db
    .delete(usersTable)
    .where(eq(usersTable.email, updatedUsers[0].email));
  console.log("User deleted!");
}

main().catch((error) => {
  console.error("Error running main function:", error);
});
 */
