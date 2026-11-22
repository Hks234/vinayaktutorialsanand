import fs from "fs";

const envPath = ".env";
if (!fs.existsSync(envPath)) {
  console.error("Missing .env. Copy .env.example to .env and paste your TiDB Cloud keys.");
  process.exit(1);
}

const source = fs.readFileSync(envPath, "utf8");
const values = {};
for (const line of source.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  values[key] = value;
}

const host = values.TIDB_HOST;
const user = values.TIDB_USER;
const password = values.TIDB_PASSWORD;
const database = values.TIDB_DATABASE || "vinayak";
const port = values.TIDB_PORT || "4000";
const cert = values.TIDB_SSL_CERT;

if (!host || !user || !password) {
  if (values.DATABASE_URL?.startsWith("mysql://") && !values.DATABASE_URL.includes("USER:PASSWORD")) {
    console.log("Using existing DATABASE_URL.");
    process.exit(0);
  }
  console.error("Paste TIDB_HOST, TIDB_USER and TIDB_PASSWORD from the TiDB Cloud connection dialog, then run this again.");
  process.exit(1);
}

const params = new URLSearchParams({ sslaccept: "strict" });
if (cert) params.set("sslcert", cert);
const url = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}?${params.toString()}`;

const next = source.includes("DATABASE_URL=")
  ? source.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${url}"`)
  : `${source.trim()}\nDATABASE_URL="${url}"\n`;

fs.writeFileSync(envPath, next.endsWith("\n") ? next : `${next}\n`);
console.log(`Wrote DATABASE_URL for ${user}@${host}:${port}/${database}`);
