import { RegistrationFormData } from './types';

/** Nach dieser Zeit wird ein liegengebliebener Entwurf verworfen. */
export const DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const serializeDraft = (data: RegistrationFormData, now: number = Date.now()): string =>
  JSON.stringify({ savedAt: new Date(now).toISOString(), data });

/**
 * Liefert den gespeicherten Entwurf, oder null wenn keiner brauchbar ist –
 * fehlend, defekt, aus einer älteren Version ohne Zeitstempel, oder zu alt.
 * Ohne Verfall würde sich jemand im nächsten Jahr mit den Daten von 2026
 * wiederfinden.
 */
export const parseDraft = (
  raw: string | null,
  now: number = Date.now(),
): Partial<RegistrationFormData> | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const savedAt = typeof parsed?.savedAt === 'string' ? Date.parse(parsed.savedAt) : NaN;

    if (Number.isNaN(savedAt) || now - savedAt > DRAFT_MAX_AGE_MS) return null;
    if (!parsed.data || typeof parsed.data !== 'object') return null;

    return parsed.data as Partial<RegistrationFormData>;
  } catch {
    return null;
  }
};
