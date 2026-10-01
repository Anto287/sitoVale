import { useTranslation } from 'react-i18next'
import { TERMS_FILES } from '../data/terms'
import type { Language } from '../i18n'
import { withBase } from '../site'

/** Scarica "Condizioni e cancellazioni" in PDF nella lingua selezionata. */
export function TermsLink({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const lng = (i18n.resolvedLanguage ?? 'en') as Language
  const file = TERMS_FILES[lng]
  return (
    <a className={className} href={withBase(file)} download={file.split('/').pop()} hrefLang={lng} type="application/pdf">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M12 4v11m-5-5 5 5 5-5M5 20h14" />
      </svg>
      {t('terms.link')} <small>PDF</small>
    </a>
  )
}
