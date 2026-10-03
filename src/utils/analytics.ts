/**
 * События для dataLayer (GTM) и gtag (GA4).
 * UTM из query подмешиваются в payload, как в ТЗ: { event, utm: { source, campaign, ... } }.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getUtmFromLocation(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const sp = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
  const utm: Record<string, string> = {};
  for (const k of keys) {
    const v = sp.get(k);
    if (v) utm[k.replace('utm_', '')] = v;
  }
  return utm;
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  const utm = getUtmFromLocation();
  const payload: Record<string, unknown> = {
    event: eventName,
    ...params,
    ...(Object.keys(utm).length > 0 ? { utm } : {}),
  };
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  } catch {
    /* ignore */
  }
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params ?? {});
    }
  } catch {
    /* ignore */
  }
}
