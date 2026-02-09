'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type ResultResponse = {
  ok: boolean;
  jobId?: string;
  txCount?: number;
  warnings?: number;
  statementPeriod?: string | null;
  files?: string[];
  error?: string;
};

export default function ResultClient({ jobId }: { jobId: string | null }) {
  const [data, setData] = useState<ResultResponse | null>(null);

  useEffect(() => {
    if (!jobId) return;
    fetch(`/api/result?jobId=${encodeURIComponent(jobId)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ ok: false, error: 'Failed to load result' }));
  }, [jobId]);

  return (
    <>
      <h1>Result</h1>
      {!jobId ? <p className="error">Missing job id.</p> : null}
      {!data ? <p>Loading...</p> : null}
      {data && !data.ok ? <p className="error">{data.error || 'Could not load result.'}</p> : null}
      {data?.ok ? (
        <>
          <div className="grid">
            <div className="card"><strong>Statement period</strong><div>{data.statementPeriod || 'Not detected'}</div></div>
            <div className="card"><strong>Transactions</strong><div>{data.txCount}</div></div>
            <div className="card"><strong>Warnings</strong><div>{data.warnings}</div></div>
          </div>
          <div className="card">
            <h3>Downloads</h3>
            {(data.files || []).map((file) => (
              <p key={file}><a className="button secondary" href={`/api/download?jobId=${encodeURIComponent(jobId || '')}&file=${encodeURIComponent(file)}`}>{file}</a></p>
            ))}
          </div>
        </>
      ) : null}
      <Link className="button" href="/convert">Convert another</Link>
    </>
  );
}
