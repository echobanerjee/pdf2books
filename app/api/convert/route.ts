import fs from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { trackEvent } from '@/lib/analytics';
import { extractPdfText } from '@/lib/server/pdf';
import { parseChaseCreditCardText } from '@/lib/parser/chaseCC';
import { ensureJobDir, cleanupOldJobs } from '@/lib/server/storage';
import { writeExports } from '@/lib/server/exports';
import { saveMeta } from '@/lib/server/jobs';

const schema = z.object({
  bank: z.literal('chase_cc'),
  statementType: z.literal('credit_card_statement'),
  password: z.string().optional()
});

export async function POST(req: NextRequest) {
  trackEvent('upload_started');
  try {
    await cleanupOldJobs();
    const form = await req.formData();
    const pdf = form.get('pdf');
    if (!(pdf instanceof File)) throw new AppError('MISSING_FILE', 'Missing PDF file.');

    const payload = schema.parse({
      bank: form.get('bank'),
      statementType: form.get('statementType'),
      password: form.get('password') || undefined
    });

    const jobId = uuidv4();
    const jobDir = await ensureJobDir(jobId);
    const uploadPath = path.join(jobDir, 'upload.pdf');
    const buffer = Buffer.from(await pdf.arrayBuffer());
    await fs.writeFile(uploadPath, buffer);

    const text = await extractPdfText(buffer, payload.password);
    const parsed = parseChaseCreditCardText(text);

    await writeExports(jobDir, parsed);
    await saveMeta(jobDir, {
      jobId,
      txCount: parsed.transactions.length,
      warnings: parsed.warnings.length,
      statementPeriod: parsed.statementPeriod,
      createdAt: new Date().toISOString(),
      retentionMinutes: 10,
      bank: payload.bank
    });

    await fs.rm(uploadPath, { force: true });

    trackEvent('upload_success', { bank: payload.bank, tx_count: parsed.transactions.length });

    return NextResponse.json({
      ok: true,
      jobId,
      txCount: parsed.transactions.length,
      warnings: parsed.warnings.length,
      statementPeriod: parsed.statementPeriod
    });
  } catch (err: any) {
    const e = err instanceof AppError ? err : err?.name === 'ZodError' ? new AppError('UNSUPPORTED_BANK', 'Unsupported bank or statement type.') : new AppError('INTERNAL_ERROR', 'Internal server error.', 500);
    trackEvent('upload_failed', { error_code: e.errorCode });
    return NextResponse.json({ ok: false, errorCode: e.errorCode, error: e.message }, { status: e.status || 400 });
  }
}
