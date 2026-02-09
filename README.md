# PDF2Books (MVP)

Convert **Chase credit card statement PDFs** (text-based) into bookkeeping-ready exports.

## Features
- Next.js + TypeScript app routes:
  - `/`
  - `/convert`
  - `/result`
  - `/privacy`
- Secure upload endpoint (`POST /api/convert`) with strict bank/type validation
- Chase CC parser module (text-PDF only)
- Exports:
  - `transactions.csv`
  - `quickbooks.csv`
  - `skipped_rows.csv`
  - `transactions.json` (optional included)
- Scanned/image PDF detection and explicit error (`UNSUPPORTED_SCANNED_PDF`)
- Password input handling (best effort)
- Privacy-first processing:
  - no file-content logging
  - uploaded PDF deleted after processing
  - cleanup of temp artifacts older than 1 hour
- Minimal analytics events for funnel + downloads
- Tests + 3 synthetic fixtures

## Local run
```bash
cd /Users/sb_mac_mini/OpenClaw/echoos/projects/pdf2books
npm install
npm run dev
```

Open: `http://localhost:3000`

## API contract
### POST `/api/convert`
Multipart form fields:
- `pdf` (required)
- `bank=chase_cc` (required)
- `statementType=credit_card_statement` (required)
- `password` (optional)

### GET `/api/result?jobId=<uuid>`
Returns conversion summary + available downloads.

### GET `/api/download?jobId=<uuid>&file=<name>`
Allowed file names:
- `transactions.csv`
- `quickbooks.csv`
- `skipped_rows.csv`
- `transactions.json`

## Tests
```bash
npm test
```

Includes parser tests for:
- tx count on 3 synthetic fixtures
- date normalization (`YYYY-MM-DD`)
- debit/credit sign logic
- multi-line wrapped row merge

Also includes storage cleanup behavior (>1 hour artifacts removed).

## Add-new-bank template (future)
1. Create parser module at `lib/parser/<bank>.ts`
2. Implement:
   - section anchoring
   - row parsing + wrapped line merge
   - date + sign normalization
   - skipped row capture
3. Add bank constant and API validation update in `POST /api/convert`
4. Add fixtures under `fixtures/<bank>/`
5. Add parser tests in `tests/`
6. Update `/convert` bank selector and docs

## Notes
- v1 supports text-based PDFs only (no OCR)
- QuickBooks export is a simple QB-friendly CSV, not an official import guarantee
