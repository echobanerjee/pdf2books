import fs from 'node:fs/promises';
import path from 'node:path';

export async function saveMeta(jobDir: string, meta: object) {
  await fs.writeFile(path.join(jobDir, 'meta.json'), JSON.stringify(meta, null, 2));
}

export async function readMeta(jobDir: string) {
  const text = await fs.readFile(path.join(jobDir, 'meta.json'), 'utf8');
  return JSON.parse(text);
}

export async function listDownloadFiles(jobDir: string) {
  const allow = new Set(['transactions.csv', 'quickbooks.csv', 'skipped_rows.csv', 'transactions.json', 'transactions.xlsx']);
  const items = await fs.readdir(jobDir);
  return items.filter((i) => allow.has(i));
}
