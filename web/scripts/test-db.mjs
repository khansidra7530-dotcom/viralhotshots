import pg from "pg";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
const env = readFileSync(envPath, "utf8");
const match = env.match(/^DATABASE_URL="([^"]+)"/m);
if (!match) {
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const client = new pg.Client({ connectionString: match[1] });

try {
  await client.connect();
  const { rows } = await client.query("SELECT NOW() AS now, current_database() AS db");
  console.log("Connected successfully");
  console.log("Database:", rows[0].db);
  console.log("Server time:", rows[0].now);
  process.exit(0);
} catch (err) {
  console.error("Connection failed:", err.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
