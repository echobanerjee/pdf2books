import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseChaseCreditCardText } from '@/lib/parser/chaseCC';
import { writeExports } from '@/lib/server/exports';

describe('exports smoke', () => {
  it('generates required export files', async () => {
    const text = [
      'CHASE CREDIT CARD STATEMENT',
      'Opening/Closing Date 12/01/25 - 12/31/25',
      '12/02 AMAZON MKTPLACE PMTS 45.67',
      '12/03 PAYMENT THANK YOU -100.00'
    ].join('\n');
    const parsed = parseChaseCreditCardText(text + '\n' + 'x'.repeat(200));

    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf2books-test-'));
    await writeExports(dir, parsed);

    for (const f of ['transactions.csv', 'quickbooks.csv', 'skipped_rows.csv', 'transactions.json']) {
      const exists = await fs.stat(path.join(dir, f)).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    }
  });
});
