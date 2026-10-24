import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { BASE, SITE_URL } from '../site'
import type en from './locales/en.json'

export const LANGUAGES = ['en', 'it', 'fr'] as const
export type Language = (typeof LANGUAGES)[number]

export const STORAGE_KEY = 'vb-lang'

export const langSegment = (lng: Language) => (lng === 'en' ? '' : `${lng}/`)
export const pathFor = (lng: Language) => BASE + langSegment(lng)
export const urlFor = (lng: Language) => `${SITE_URL}/${langSegment(lng)}`
export const langFromPath = (pathname: string): Language =>
  (pathname.slice(BASE.length - 1).match(/^\/(it|fr)(\/|$)/)?.[1] as Language) ?? 'en'

export type Translation = typeof en
const loaders: Record<Language, () => Promise<{ default: Translation }>> = {
  en: () => import('./locales/en.json'),
  it: () => import('./locales/it.json'),
  fr: () => import('./locales/fr.json'),
}

const isBrowser = typeof window !== 'undefined'

function inlineTexts(): { lng: Language; translation: Translation } | undefined {
  const el = document.getElementById('vb-i18n')
  try {
    return el?.textContent ? JSON.parse(el.textContent) : undefined
  } catch {
    return undefined
  }
}

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

export function chooseLanguage(lng: Language) {
  try {
    sessionStorage.setItem(STORAGE_KEY, lng)
  } catch {
  }
  history.replaceState(null, '', pathFor(lng) + location.hash)
  void loadLanguage(lng).then(() => i18n.changeLanguage(lng))
}

export default i18n
