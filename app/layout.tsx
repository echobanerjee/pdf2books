import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PDF2Books',
  description: 'Convert Chase credit card statement PDFs into bookkeeping-ready CSVs.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
