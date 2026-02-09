import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldJobs, getJobDir } from '@/lib/server/storage';
import { listDownloadFiles, readMeta } from '@/lib/server/jobs';

export async function GET(req: NextRequest) {
  await cleanupOldJobs();
  const jobId = req.nextUrl.searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ ok: false, error: 'Missing jobId' }, { status: 400 });

  try {
    const jobDir = getJobDir(jobId);
    const meta = await readMeta(jobDir);
    const files = await listDownloadFiles(jobDir);
    return NextResponse.json({ ok: true, ...meta, files });
  } catch {
    return NextResponse.json({ ok: false, error: 'Result not found or expired.' }, { status: 404 });
  }
}
