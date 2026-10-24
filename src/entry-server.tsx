// oxlint-disable react/only-export-components -- entry della build, non un modulo di componenti
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import i18n, { loadLanguage, type Language } from './i18n'

export { GOATCOUNTER } from './config'
export { IS_FINAL_URL, SITE_URL } from './site'
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
    title: i18n.t('meta.title'),
    description: i18n.t('meta.description'),
  }
}
