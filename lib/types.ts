export type NormalizedTransaction = {
  date: string;
  description: string;
  merchant: string;
  amount: number;
  currency: string;
  description_raw: string;
};

export type SkippedRow = { raw_line: string; reason: string };

export type ParseResult = {
  transactions: NormalizedTransaction[];
  skipped: SkippedRow[];
  warnings: string[];
  statementPeriod: string | null;
  currency: string;
};
