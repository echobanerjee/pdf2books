import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseChaseCreditCardText } from '@/lib/parser/chaseCC';

function fixture(name: string) {
  return fs.readFileSync(path.join(process.cwd(), 'fixtures/chase_cc', name), 'utf8');
}

describe('Chase parser', () => {
  it('returns expected tx counts for 3 fixtures', () => {
    expect(parseChaseCreditCardText(fixture('sample1.txt')).transactions.length).toBe(3);
    expect(parseChaseCreditCardText(fixture('sample2.txt')).transactions.length).toBe(3);
    expect(parseChaseCreditCardText(fixture('sample3.txt')).transactions.length).toBe(4);
  });

  it('parses dates as YYYY-MM-DD', () => {
    const r = parseChaseCreditCardText(fixture('sample1.txt'));
    expect(r.transactions[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(r.transactions[0].date).toBe('2025-12-02');
  });

  it('applies debit negative and credit positive', () => {
    const r = parseChaseCreditCardText(fixture('sample1.txt'));
    expect(r.transactions[0].amount).toBeLessThan(0);
    expect(r.transactions[2].amount).toBeGreaterThan(0);
  });

  it('merges wrapped lines into prior transaction description', () => {
    const r = parseChaseCreditCardText(fixture('sample2.txt'));
    expect(r.transactions[0].description.toLowerCase()).toContain('continued downtown location');
  });
});
