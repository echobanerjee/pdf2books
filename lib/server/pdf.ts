import { getDocument, PasswordResponses } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { AppError } from '@/lib/errors';

export async function extractPdfText(buffer: Buffer, password?: string) {
  let loadingTask: ReturnType<typeof getDocument> | undefined;
  try {
    loadingTask = getDocument({ data: new Uint8Array(buffer), password: password || undefined });
    const pdf = await loadingTask.promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((x: any) => x.str || '').join(' ') + '\n';
    }
    return text;
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (err?.code === PasswordResponses.NEED_PASSWORD || msg.includes('No password')) {
      throw new AppError('PDF_PASSWORD_REQUIRED', 'Password required for this PDF.');
    }
    if (err?.code === PasswordResponses.INCORRECT_PASSWORD || msg.toLowerCase().includes('incorrect password')) {
      throw new AppError('PDF_PASSWORD_INVALID', 'Invalid PDF password.');
    }
    throw new AppError('PARSE_FAILED', 'Unable to read PDF content.');
  } finally {
    loadingTask?.destroy();
  }
}
