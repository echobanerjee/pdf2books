import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.join(os.tmpdir(), 'pdf2books-jobs');

export function getJobDir(jobId: string) {
  return path.join(ROOT, jobId);
}

export async function ensureJobDir(jobId: string) {
  const dir = getJobDir(jobId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function cleanupOldJobs(maxAgeMs = 60 * 60 * 1000) {
  await fs.mkdir(ROOT, { recursive: true });
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const now = Date.now();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(ROOT, entry.name);
    const st = await fs.stat(dir);
    if (now - st.mtimeMs > maxAgeMs) {
      await fs.rm(dir, { recursive: true, force: true });
    }
  }
}
