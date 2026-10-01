import type { Language } from '../i18n'

/**
 * Condizioni e cancellazioni in PDF, una per lingua, in public/docs/.
 * Generate da `npm run terms` (scripts/build-terms.mjs, testi in scripts/terms-content.mjs).
 */
export const TERMS_FILES: Record<Language, string> = {
  en: 'docs/Valentina-Bernardi-Terms-and-Cancellation-Policy.pdf',
  it: 'docs/Valentina-Bernardi-Condizioni-e-Cancellazioni.pdf',
  fr: 'docs/Valentina-Bernardi-Conditions-et-Annulation.pdf',
}
