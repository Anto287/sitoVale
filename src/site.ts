import { SITE_URL as FINAL_SITE_URL } from './config'

/**
 * Indirizzo e cartella a cui è pubblicata questa build. Li decide la GitHub Action
 * (actions/configure-pages) in base a come è configurato GitHub Pages:
 * - senza dominio:  https://anto287.github.io/sitoVale  →  percorsi sotto /sitoVale/
 * - con il dominio: https://www.vallyski.com            →  percorsi alla radice
 * In locale (npm run dev / build senza variabili) valgono il dominio di config.ts e la radice.
 */
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || FINAL_SITE_URL

/** true solo sul dominio definitivo: altrove le pagine chiedono di non essere indicizzate. */
export const IS_FINAL_URL = SITE_URL === FINAL_SITE_URL

/** Cartella del sito: "/" oppure "/sitoVale/". */
export const BASE = import.meta.env.BASE_URL

/** Aggiunge la cartella del sito a un percorso assoluto: "/images/x.webp" → "/sitoVale/images/x.webp". */
export const withBase = (path: string) => BASE + path.replace(/^\//, '')
