import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <div className="card">
        <h1>Convert Chase statement PDFs to bookkeeping-ready CSV in minutes</h1>
        <p>Upload a Chase credit card statement PDF and download transactions + QuickBooks-friendly CSV exports.</p>
        <Link className="button" href="/convert">Upload PDF</Link>
      </div>
      <div className="card small">
        Best results with text-based PDFs. Scanned PDFs not supported in v1.
      </div>
      <div className="card small">
        Files deleted automatically after conversion.
      </div>
    </main>
  );
}
