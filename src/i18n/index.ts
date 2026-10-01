import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { BASE, SITE_URL } from '../site'
import type en from './locales/en.json'

export const LANGUAGES = ['en', 'it', 'fr'] as const
export type Language = (typeof LANGUAGES)[number]

/** Scelta manuale fatta con i pulsanti EN/IT/FR, valida per la visita in corso (letta anche dallo script in index.html). */
export const STORAGE_KEY = 'vb-lang'

/** Ogni lingua ha il suo indirizzo: l'inglese è la home, le altre una cartella ("it/", "fr/"). */
export const langSegment = (lng: Language) => (lng === 'en' ? '' : `${lng}/`)
/** Percorso della lingua nel sito, cartella base compresa: "/", "/it/" (o "/sitoVale/it/"). */
export const pathFor = (lng: Language) => BASE + langSegment(lng)
/** Indirizzo completo della lingua, per canonical, hreflang e sitemap. */
export const urlFor = (lng: Language) => `${SITE_URL}/${langSegment(lng)}`
export const langFromPath = (pathname: string): Language =>
  (pathname.slice(BASE.length - 1).match(/^\/(it|fr)(\/|$)/)?.[1] as Language) ?? 'en'

// Un file per lingua in ./locales, ognuno in un file JavaScript a parte: si scarica solo quello che serve.
// L'inglese è il riferimento: le sue chiavi definiscono i tipi (i18next.d.ts e `loaders` qui sotto),
// quindi una chiave mancante in it/fr è un errore di build.
export type Translation = typeof en
const loaders: Record<Language, () => Promise<{ default: Translation }>> = {
  en: () => import('./locales/en.json'),
  it: () => import('./locales/it.json'),
  fr: () => import('./locales/fr.json'),
}

const isBrowser = typeof window !== 'undefined'

/**
 * Testi della lingua della pagina, scritti nell'HTML da scripts/prerender.mjs come blocco di dati
 * (<script type="application/json">, non eseguito: la Content-Security-Policy non deve autorizzarlo).
 */
function inlineTexts(): { lng: Language; translation: Translation } | undefined {
  const el = document.getElementById('vb-i18n')
  try {
    return el?.textContent ? JSON.parse(el.textContent) : undefined
  } catch {
    return undefined
  }
}

// La lingua della pagina è quella dell'indirizzo: l'HTML pre-generato e React devono coincidere.
// (Il rilevamento dal browser avviene prima, in index.html, e porta già all'indirizzo giusto.)
const initial = isBrowser ? langFromPath(location.pathname) : 'en'
const fromPage = isBrowser ? inlineTexts() : undefined
const inline = fromPage?.lng === initial ? fromPage : undefined

void i18n.use(initReactI18next).init({
  resources: inline ? { [inline.lng]: { translation: inline.translation } } : {},
  partialBundledLanguages: true,
  lng: initial,
  fallbackLng: 'en',
  supportedLngs: LANGUAGES,
  interpolation: { escapeValue: false },
  returnNull: false,
  initAsync: false,
})

/** Scarica (una volta sola) i testi di una lingua. */
export async function loadLanguage(lng: Language) {
  if (i18n.hasResourceBundle(lng, 'translation')) return
  i18n.addResourceBundle(lng, 'translation', (await loaders[lng]()).default)
}

function syncDocument() {
  const lng = (i18n.resolvedLanguage ?? 'en') as Language
  document.documentElement.lang = lng
  document.title = i18n.t('meta.title')
  document.querySelector('meta[name="description"]')?.setAttribute('content', i18n.t('meta.description'))
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', urlFor(lng))
}
if (isBrowser) i18n.on('languageChanged', syncDocument)

/** Cambio lingua dai pulsanti: senza ricaricare, con l'indirizzo aggiornato e la scelta ricordata fino alla fine della visita. */
export function chooseLanguage(lng: Language) {
  try {
    sessionStorage.setItem(STORAGE_KEY, lng)
  } catch {
    /* storage non disponibile (navigazione privata): va bene lo stesso */
  }
  history.replaceState(null, '', pathFor(lng) + location.hash)
  void loadLanguage(lng).then(() => i18n.changeLanguage(lng))
}

export default i18n
