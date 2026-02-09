export function trackEvent(event: string, props: Record<string, unknown> = {}) {
  const safeProps = Object.fromEntries(Object.entries(props).filter(([k]) => !k.toLowerCase().includes('text') && !k.toLowerCase().includes('content')));
  console.info('[analytics]', event, safeProps);
}
