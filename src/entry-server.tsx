// oxlint-disable react/only-export-components -- entry della build, non un modulo di componenti
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import { LegalNotice } from './components/LegalNotice'
import i18n, { loadLanguage, type Language } from './i18n'

export { CLOUDFLARE_WEB_ANALYTICS, GOATCOUNTER, TURNSTILE_SITE_KEY } from './config'
export { BASE, IS_FINAL_URL, SITE_URL } from './site'
export { LANGUAGES, langSegment, urlFor } from './i18n'

export async function render(lng: Language) {
  await loadLanguage(lng)
  await i18n.changeLanguage(lng)
  return {
    translation: i18n.getResourceBundle(lng, 'translation'),
    html: renderToString(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
    legal: renderToString(<LegalNotice lang={lng} />),
    legalTitle: i18n.t('legal.legalTitle'),
    title: i18n.t('meta.title'),
    description: i18n.t('meta.description'),
  }
}
