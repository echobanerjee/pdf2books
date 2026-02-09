import ResultClient from './ResultClient';

export default function ResultPage({ searchParams }: { searchParams: { jobId?: string } }) {
  return (
    <main>
      <ResultClient jobId={searchParams.jobId ?? null} />
    </main>
  );
}
