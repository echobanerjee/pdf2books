'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConvertPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch('/api/convert', { method: 'POST', body: formData });
    const data = await res.json();

    setLoading(false);

    if (!data.ok) {
      setError(data.error || 'Conversion failed');
      return;
    }

    router.push(`/result?jobId=${encodeURIComponent(data.jobId)}`);
  }

  return (
    <main>
      <h1>Convert statement</h1>
      <form className="card" onSubmit={onSubmit}>
        <label htmlFor="pdf">PDF file</label>
        <input id="pdf" name="pdf" type="file" accept="application/pdf" required />

        <label htmlFor="bank">Bank</label>
        <select id="bank" name="bank" defaultValue="chase_cc" required>
          <option value="chase_cc">Chase Credit Card</option>
        </select>

        <label htmlFor="statementType">Statement type</label>
        <select id="statementType" name="statementType" defaultValue="credit_card_statement" required>
          <option value="credit_card_statement">Credit card statement</option>
        </select>

        <label htmlFor="password">PDF password (optional)</label>
        <input id="password" name="password" type="password" placeholder="Enter password if required" />

        <button className="button" type="submit" disabled={loading}>{loading ? 'Converting...' : 'Convert PDF'}</button>
        {error ? <p className="error">{error}</p> : null}
      </form>
    </main>
  );
}
