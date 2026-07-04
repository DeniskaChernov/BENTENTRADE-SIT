/**
 * Cross-platform D1 backup helper.
 * Exports the remote `bententrade_db` to a timestamped SQL file under ./backups.
 *
 * Usage: npm run db:backup [-- --local]
 */
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const local = process.argv.includes("--local");
const scope = local ? "--local" : "--remote";

const dir = resolve(process.cwd(), "backups");
mkdirSync(dir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const out = resolve(dir, `bententrade_db-${local ? "local" : "remote"}-${stamp}.sql`);

const args = ["d1", "export", "bententrade_db", scope, "--output", out];
console.log("Running: wrangler " + args.join(" "));

const res = spawnSync("wrangler", args, { stdio: "inherit", shell: true });
if (res.status !== 0) {
  console.error("Backup failed with exit code", res.status);
  process.exit(res.status || 1);
}
console.log("Backup written to", out);
