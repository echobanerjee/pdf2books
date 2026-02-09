import { ParseResult, NormalizedTransaction, SkippedRow } from '@/lib/types';
import { AppError } from '@/lib/errors';

const TX_LINE = /^(\d{2}\/\d{2})\s+(.+?)\s+(-?\$?[\d,]+\.\d{2})$/;

export function normalizeMerchant(raw: string) {
  let m = raw.toLowerCase();
  m = m.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ');
  m = m.replace(/#\d+\b/g, ' ');
  m = m.replace(/^sq\s*/i, 'square ');
  m = m.replace(/^amzn\s*/i, 'amazon ');
  m = m.replace(/^uber\s*/i, 'uber ');
  m = m.replace(/\s+/g, ' ').trim();
  return m;
}

function parseDate(mmdd: string, yearHint: number) {
  const [mm, dd] = mmdd.split('/').map(Number);
  const d = new Date(Date.UTC(yearHint, mm - 1, dd));
  return d.toISOString().slice(0, 10);
}

function parseAmount(v: string) {
  const cleaned = v.replace(/[$,]/g, '');
  const num = Number(cleaned);
  if (cleaned.trim().startsWith('-')) return Math.abs(num);
  return -Math.abs(num);
}

export function parseChaseCreditCardText(text: string): ParseResult {
  if (text.replace(/\s/g, '').length < 120) {
    throw new AppError('UNSUPPORTED_SCANNED_PDF', 'This looks like an image-based PDF. v1 supports text-based statements only.');
  }

  const periodMatch = text.match(/Opening\/Closing Date\s+(\d{2}\/\d{2}\/\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})/i);
  const statementPeriod = periodMatch
    ? `20${periodMatch[1].slice(-2)}-${periodMatch[1].slice(0,2)}-${periodMatch[1].slice(3,5)}..20${periodMatch[2].slice(-2)}-${periodMatch[2].slice(0,2)}-${periodMatch[2].slice(3,5)}`
    : null;

  const year = periodMatch ? Number(`20${periodMatch[2].slice(-2)}`) : new Date().getUTCFullYear();

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const tx: NormalizedTransaction[] = [];
  const skipped: SkippedRow[] = [];
  const warnings: string[] = [];
  let current: { date: string; desc: string; amount: number; raw: string } | null = null;

  for (const line of lines) {
    const m = line.match(TX_LINE);
    if (m) {
      if (current) {
        tx.push({
          date: current.date,
          description: current.desc,
          merchant: normalizeMerchant(current.desc),
          amount: current.amount,
          currency: 'USD',
          description_raw: current.raw
        });
      }
      current = {
        date: parseDate(m[1], year),
        desc: m[2],
        amount: parseAmount(m[3]),
        raw: m[2]
      };
      continue;
    }

    if (current && /^[A-Za-z0-9].{2,}$/.test(line) && !line.includes('Opening/Closing Date')) {
      current.desc += ` ${line}`;
      current.raw += ` ${line}`;
      warnings.push('wrapped_line_merged');
      continue;
    }

    if (/\d{2}\/\d{2}/.test(line) || /\$\d+/.test(line)) {
      skipped.push({ raw_line: line, reason: 'unparsed_or_low_confidence' });
    }
  }

  if (current) {
    tx.push({
      date: current.date,
      description: current.desc,
      merchant: normalizeMerchant(current.desc),
      amount: current.amount,
      currency: 'USD',
      description_raw: current.raw
    });
  }

  if (tx.length === 0) throw new AppError('PARSE_FAILED', 'No transactions could be parsed from this statement.');

  return { transactions: tx, skipped, warnings, statementPeriod, currency: 'USD' };
}
