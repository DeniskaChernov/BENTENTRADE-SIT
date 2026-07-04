/* Manual PostgreSQL helpers: `npm run pg:migrate` / `npm run pg:seed`.
   The server also runs migrate + seed automatically on boot. */
import { migrate, seedIfEmpty, pool } from "../server/runtime";

const cmd = process.argv[2];

(async () => {
  try {
    if (cmd === "migrate") {
      await migrate();
      console.log("[pg] schema applied");
    } else if (cmd === "seed") {
      const seeded = await seedIfEmpty();
      console.log(seeded ? "[pg] seeded from front-end data" : "[pg] products already present — skipped");
    } else {
      console.log("usage: tsx scripts/pg-cli.ts <migrate|seed>");
      process.exitCode = 1;
    }
  } catch (e) {
    console.error("[pg] error:", (e as Error).message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
