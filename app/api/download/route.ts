import fs from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldJobs, getJobDir } from '@/lib/server/storage';
import { trackEvent } from '@/lib/analytics';

const ALLOWED = new Set(['transactions.csv', 'quickbooks.csv', 'skipped_rows.csv', 'transactions.json', 'transactions.xlsx']);

export async function GET(req: NextRequest) {
  await cleanupOldJobs();
  const jobId = req.nextUrl.searchParams.get('jobId');
  const file = req.nextUrl.searchParams.get('file');
  if (!jobId || !file || !ALLOWED.has(file)) {
    return NextResponse.json({ ok: false, error: 'Invalid download request' }, { status: 400 });
  }

  try {
    const fullPath = path.join(getJobDir(jobId), file);
    const data = await fs.readFile(fullPath);

    if (file === 'transactions.csv') trackEvent('download_transactions_csv', { jobId });
    if (file === 'quickbooks.csv') trackEvent('download_quickbooks_csv', { jobId });

    return new NextResponse(data, {
      headers: {
        'content-type': file.endsWith('.json') ? 'application/json' : 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename=\"${file}\"`
      }
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'File not found or expired.' }, { status: 404 });
  }
}
