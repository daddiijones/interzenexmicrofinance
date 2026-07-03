import path from "path";

// Uploaded files (profile photos, passport documents) must live outside
// `public/` — the deploy process overwrites `public/` from the git repo on
// every release, which would wipe anything stored there. This directory is
// gitignored and untouched by deploys. Set UPLOAD_DIR in production .env to
// an absolute path if you want certainty regardless of the process's cwd.
export function getUploadDir() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
}
