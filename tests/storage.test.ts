import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { cleanupOldJobs } from '@/lib/server/storage';

describe('cleanup', () => {
  it('removes temp artifacts older than 1 hour', async () => {
    const root = path.join(os.tmpdir(), 'pdf2books-jobs');
    const old = path.join(root, 'old-job-test');
    await fs.mkdir(old, { recursive: true });
    const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await fs.utimes(old, oldDate, oldDate);

    await cleanupOldJobs(60 * 60 * 1000);

    const exists = await fs.stat(old).then(() => true).catch(() => false);
    expect(exists).toBe(false);
  });
});
