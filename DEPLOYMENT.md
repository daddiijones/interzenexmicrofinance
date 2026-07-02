# Deploying Interzenex Microfinance to Namecheap cPanel

This is a **Next.js 16 App Router** app (not the Vite+Express setup used on previous projects on this hosting account) — Prisma ORM, bcrypt + email-OTP auth, nodemailer for mail. Locally it runs against SQLite (`prisma/dev.db`); production needs MySQL, since that's what Namecheap shared hosting offers via phpMyAdmin.

There's no custom Express server here. Passenger (cPanel's Node.js app manager) needs a plain Node entry point, so we build with Next's `output: "standalone"` mode, which generates a self-contained `server.js` — that becomes the Passenger startup file.

## 0. Required code changes before the first deploy

Done already, all local, nothing pushed yet:

1. **`prisma/schema.production.prisma`** (new file) — MySQL version of the schema, used only on the server (`provider = "mysql"`, `url = env("DATABASE_URL")`). Local dev keeps using `prisma/schema.prisma` (SQLite) unchanged, so `npm run dev` needs no local MySQL install. Keep the two files' models in sync by hand when the schema changes — Prisma has no built-in way to share one model list across two datasources.

2. **`next.config.mjs`** — added `output: "standalone"` so the build produces a Passenger-compatible `server.js`.

3. **`src/app/api/seed/route.js`** — this was a `GET` route with **no auth check** that wipes `Transaction`, `Card`, `Loan`, `SupportTicket`, `Account`, `AuditLog`, and `User` tables and recreates demo data; anyone who visited `/api/seed` could delete all real user data. Now gated: in production it 404s unless `ALLOW_SEED=true` is set. Set that env var temporarily for the initial seed (step 6), then remove it.

4. **`.gitignore`** — added `prisma/*.db` and `prisma/*.db-journal` so the local SQLite dev database (with test data) never gets committed.

## 1. Push to GitHub

```bash
git init
git add -A
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:daddiijones/interzenexmicrofinance.git
git push -u origin main
```

## 2. Create the Node.js App in cPanel

**cPanel → Setup Node.js App → Create Application**

| Field | Value |
|---|---|
| Node.js version | Highest available (≥20.x) |
| Application mode | Production |
| Application root | `interzenexmicrofinance` |
| Application URL | `interzenexmicrofinance.online` |
| Application startup file | `.next/standalone/server.js` |
| Environment variables | added in step 6 below |

cPanel auto-creates the app root with placeholder files and a Node virtual environment (`nodevenv`) — **don't delete `tmp/`**, Passenger uses it for restart signaling.

## 3. Get a terminal into the app's environment

The "Setup Node.js App" page gives you an activation command — run it every time you open a new terminal session, it doesn't persist:

```bash
source /home/<user>/nodevenv/interzenexmicrofinance/<node-version>/bin/activate && cd /home/<user>/interzenexmicrofinance
which node && node -v   # sanity check the venv is actually active
```

## 4. Get the real repo into the app root

The app root already has cPanel's placeholder files, so a plain `git clone` fails ("directory not empty"). Move the conflicting files out of the way, then init + pull instead of clone:

```bash
mv app.js app.js.bak 2>/dev/null
git init
git remote add origin https://github.com/daddiijones/interzenexmicrofinance.git   # HTTPS is fine if the repo is public
git pull origin main
git branch -M main
git branch --set-upstream-to=origin/main main   # so future updates are just `git pull`
rm -f app.js.bak
```

(If the repo is private, use a GitHub Personal Access Token in the clone URL, or cPanel's own Git Version Control tool.)

## 5. Create `.env` on the server

```bash
cat > /home/<user>/interzenexmicrofinance/.env << 'EOF'
DATABASE_URL="mysql://<db_user>:<url_encoded_password>@localhost:3306/<db_name>"
MAILTRAP_HOST=<real SMTP host for interzenexmicrofinance.online>
MAILTRAP_PORT=465
MAILTRAP_USER=<smtp username>
MAILTRAP_PASS=<smtp password>
MAIL_FROM="Interzenex Microfinance <support@interzenexmicrofinance.online>"
OTP_RESEND_COOLDOWN_SECONDS=60
EOF
```

The `MAILTRAP_*` variable names are what `src/lib/mailer.js` reads — locally they point at a Mailtrap sandbox, but in production point them at your real SMTP credentials for `interzenexmicrofinance.online` (same variable names, real values).

**Gotcha:** any special character in the DB password (`@`, `:`, `/`, etc.) must be percent-encoded in `DATABASE_URL` or the URL parser misreads where the password ends.

**Gotcha:** `localhost` in `DATABASE_URL` only resolves correctly *on the server itself* — Remote MySQL is generally not enabled on shared hosting. All DB setup (`prisma db push`) has to happen from this SSH session, not from your local machine.

**Also copy this same `.env` into the standalone build directory** after each deploy (step 7) — the standalone `server.js` reads env vars relative to its own directory, not the repo root:

```bash
cp .env .next/standalone/.env
```

As a belt-and-suspenders backup, also add the same variables in cPanel's **Setup Node.js App → Environment Variables** UI — those get injected into `process.env` directly regardless of `.env` file loading.

## 6. Install, generate, push schema

```bash
npm install
npx prisma generate --schema=prisma/schema.production.prisma
npx prisma db push --schema=prisma/schema.production.prisma      # creates tables in the MySQL database
```

(Always pass `--schema=prisma/schema.production.prisma` on the server — the bare `npx prisma ...` defaults to `prisma/schema.prisma`, which is the SQLite dev schema and doesn't have a `DATABASE_URL` to read.)

**Gotcha:** `@prisma/client`'s own install hook silently runs `prisma generate` against the default `prisma/schema.prisma` (SQLite) every time you run `npm install`. That's harmless as long as the explicit `--schema=prisma/schema.production.prisma` generate command above always runs *after* `npm install`, since it overwrites the generated client last — just don't skip it or reorder it.

Then seed once via `/api/seed` (with `ALLOW_SEED=true` set temporarily per step 0.3), or write a one-off seed script — **do not** leave the seed route reachable afterward. It purges and recreates all data, so never re-run it once the site has real users.

Default admin after seeding: `admin@interzenexmicrofinance.online` / `admin2026!` (from `src/app/api/seed/route.js`) — log in once and change the password immediately, don't leave the seeded default live.

## 7. Build

**Build locally, not on the server.** `next build` (webpack-based compilation) is memory-hungry and is a known way to hit OOM/resource-limit crashes under CloudLinux's per-account caps on shared hosting — the same class of problem as esbuild OOMs on past projects on this account, just via a different build tool.

The fix: build the standalone output locally, then commit and push it. No build step runs on the server at all.

```bash
# on your own machine, after making changes to src/
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
git add -f .next/standalone
git commit -m "rebuild standalone output"
git push

# on the server
git pull
cp .env .next/standalone/.env
```

`.next/` is gitignored by default — use `git add -f` to force-add just the `standalone` subfolder (don't remove `/.next/` from `.gitignore` wholesale, or you'll also commit the much larger build cache).

If `package.json` changes, `npm install` is fine to run on the server; it's specifically the `next build` step that risks OOM there.

## 8. Restart and verify

cPanel → Setup Node.js App → your app → **Restart**.

Then check:
- `https://interzenexmicrofinance.online/` loads the landing page (not 503/blank)
- Login → OTP flow works end-to-end, including the email actually arriving (confirms real SMTP creds are correct, not leftover Mailtrap sandbox values)
- Dashboard, transactions, and admin panel render real data from MySQL
- `/api/seed` returns 404 (confirms it's locked down, not silently reachable)

## Redeploying after future changes

```bash
# locally
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
git add -f .next/standalone
git commit -m "rebuild standalone output"
git push

# on the server
git pull
cp .env .next/standalone/.env
npm install              # only if package.json changed
npx prisma generate --schema=prisma/schema.production.prisma   # only if the schema changed
npx prisma db push --schema=prisma/schema.production.prisma    # only if the schema changed
```
Then restart the app from the cPanel UI.
