export default function PrivacyPage() {
  return (
    <main>
      <h1>Privacy</h1>
      <div className="card">
        <p>We only process your uploaded PDF to generate exports.</p>
        <p>We do not log PDF file contents or extracted transaction text.</p>
        <p>Uploaded files are deleted immediately after conversion output is generated.</p>
        <p>Generated artifacts are kept briefly for download and are eligible for cleanup after one hour.</p>
      </div>
    </main>
  );
}
