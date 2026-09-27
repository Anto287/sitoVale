// oxlint-disable react/only-export-components -- entry della build, non un modulo di componenti
/**
 * Usato solo in build (scripts/prerender.mjs): genera l'HTML completo di ogni lingua,
 * così motori di ricerca e anteprime social leggono i testi senza eseguire JavaScript.
 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import i18n, { type Language } from './i18n'

export { SITE_URL } from './config'
export { LANGUAGES, pathFor } from './i18n'

export async function render(lng: Language) {
  await i18n.changeLanguage(lng)
  return {
    html: renderToString(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
    title: i18n.t('meta.title'),
    description: i18n.t('meta.description'),
  }
}
