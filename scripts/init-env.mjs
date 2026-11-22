import fs from "fs";
import crypto from "crypto";

const path = ".env";
if (fs.existsSync(path)) {
  console.log(".env already exists");
  process.exit(0);
}

const secret = crypto.randomBytes(32).toString("hex");
const body = `TIDB_HOST=""
TIDB_PORT="4000"
TIDB_USER=""
TIDB_PASSWORD=""
TIDB_DATABASE="vinayak"
TIDB_SSL_CERT=""
DATABASE_URL="mysql://USER:PASSWORD@HOST:4000/vinayak?sslaccept=strict"
AUTH_SECRET="${secret}"
COOKIE_SECURE="false"
ADMIN_USER_ID="user-PVIANYAK@33445566"
ADMIN_PASSWORD="ViNAYAKtuTOrials"
ADMIN_NAME="Vinayak Admin"
FACULTY_PASSWORD="VinayakFac1"
DEMO_STUDENT_PASSWORD="VinayakStu1"
`;

fs.writeFileSync(path, body);
console.log("Created .env. Paste your TiDB Cloud keys, then run npm run db:tidb");
