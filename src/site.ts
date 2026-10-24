import { SITE_URL as FINAL_SITE_URL } from './config'

/**
 * Cloudflare Pages serve il sito alla radice; il dominio canonico è in config.ts.
 * VITE_SITE_URL consente una build di prova esplicitamente non indicizzabile.
 * Non usare CF_PAGES_URL: cambierebbe canonical e sitemap con l'URL di ogni deploy.
 */
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || FINAL_SITE_URL

/** true solo sul dominio definitivo: altrove le pagine chiedono di non essere indicizzate. */
export const IS_FINAL_URL = SITE_URL === FINAL_SITE_URL

/** Cartella del sito: "/" su Cloudflare Pages. */
export const BASE = import.meta.env.BASE_URL

/** Aggiunge la cartella del sito a un percorso assoluto: "/images/x.webp" → "/sitoVale/images/x.webp". */
export const withBase = (path: string) => BASE + path.replace(/^\//, '')
