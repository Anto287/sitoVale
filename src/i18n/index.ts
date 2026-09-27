import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { BASE, SITE_URL } from '../site'
import en from './locales/en.json'
import fr from './locales/fr.json'
import it from './locales/it.json'

export const LANGUAGES = ['en', 'it', 'fr'] as const
export type Language = (typeof LANGUAGES)[number]

/** Scelta manuale fatta con i pulsanti EN/IT/FR (letta anche dallo script in index.html). */
export const STORAGE_KEY = 'vb-lang'

/** Ogni lingua ha il suo indirizzo: l'inglese è la home, le altre una cartella ("it/", "fr/"). */
export const langSegment = (lng: Language) => (lng === 'en' ? '' : `${lng}/`)
/** Percorso della lingua nel sito, cartella base compresa: "/", "/it/" (o "/sitoVale/it/"). */
export const pathFor = (lng: Language) => BASE + langSegment(lng)
/** Indirizzo completo della lingua, per canonical, hreflang e sitemap. */
export const urlFor = (lng: Language) => `${SITE_URL}/${langSegment(lng)}`
export const langFromPath = (pathname: string): Language =>
  (pathname.slice(BASE.length - 1).match(/^\/(it|fr)(\/|$)/)?.[1] as Language) ?? 'en'

// Un file per lingua in ./locales. L'inglese è il riferimento: le sue chiavi
// definiscono i tipi (i18next.d.ts), quindi una chiave mancante in it/fr è un errore.
const resources = {
  en: { translation: en },
  it: { translation: it satisfies typeof en },
  fr: { translation: fr satisfies typeof en },
}

const isBrowser = typeof window !== 'undefined'

// La lingua della pagina è quella dell'indirizzo: l'HTML pre-generato e React devono coincidere.
// (Il rilevamento dal browser avviene prima, in index.html, e porta già all'indirizzo giusto.)
void i18n.use(initReactI18next).init({
  resources,
  lng: isBrowser ? langFromPath(location.pathname) : 'en',
  fallbackLng: 'en',
  supportedLngs: LANGUAGES,
  interpolation: { escapeValue: false },
  returnNull: false,
  initAsync: false,
})

function syncDocument() {
  const lng = (i18n.resolvedLanguage ?? 'en') as Language
  document.documentElement.lang = lng
  document.title = i18n.t('meta.title')
  document.querySelector('meta[name="description"]')?.setAttribute('content', i18n.t('meta.description'))
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', urlFor(lng))
}
if (isBrowser) i18n.on('languageChanged', syncDocument)

/** Cambio lingua dai pulsanti: senza ricaricare, con l'indirizzo aggiornato e la scelta ricordata. */
export function chooseLanguage(lng: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lng)
  } catch {
    /* storage non disponibile (navigazione privata): va bene lo stesso */
  }
  history.replaceState(null, '', pathFor(lng) + location.hash)
  void i18n.changeLanguage(lng)
}

export default i18n
