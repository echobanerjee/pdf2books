import fs from 'node:fs/promises';
import path from 'node:path';
import { ParseResult } from '@/lib/types';

function toCsv(rows: string[][]) {
  return rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n') + '\n';
}

export async function writeExports(jobDir: string, parsed: ParseResult) {
  const transactionsCsv = toCsv([
    ['date', 'description', 'merchant', 'amount', 'currency'],
    ...parsed.transactions.map((t) => [t.date, t.description, t.merchant, t.amount.toFixed(2), t.currency])
  ]);

  const quickbooksCsv = toCsv([
    ['Date', 'Description', 'Amount'],
    ...parsed.transactions.map((t) => [t.date, t.description, t.amount.toFixed(2)])
  ]);

  const skippedCsv = toCsv([
    ['raw_line', 'reason'],
    ...parsed.skipped.map((s) => [s.raw_line, s.reason])
  ]);

  await fs.writeFile(path.join(jobDir, 'transactions.csv'), transactionsCsv);
  await fs.writeFile(path.join(jobDir, 'quickbooks.csv'), quickbooksCsv);
  await fs.writeFile(path.join(jobDir, 'skipped_rows.csv'), skippedCsv);
  await fs.writeFile(path.join(jobDir, 'transactions.json'), JSON.stringify(parsed.transactions, null, 2));
}
