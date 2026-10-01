/*
 * Unico punto da cui partono dominio, contatti e dati legali.
 * Vengono usati dal sito, da index.html (dati per Google, anteprime social),
 * da sitemap.xml e robots.txt (generati in build): si cambiano solo qui.
 * I testi tradotti stanno in src/i18n/locales/{en,it,fr}.json.
 */

/** Indirizzo pubblico del sito, senza "/" finale. */
export const SITE_URL = 'https://www.vallyski.com'

// PERSONALIZZARE: contatti reali.
export const CONTACT = {
  /** Numero WhatsApp con prefisso internazionale, senza "+" e senza spazi (39 = Italia). */
  whatsapp: '393889397424',
  whatsappLabel: '+39 388 939 7424',
  email: 'bernardivale46@gmail.com',
  emailLabel: 'bernardivale46@gmail.com',
  instagram: 'https://instagram.com/vally.it',
  instagramLabel: 'vally.it',
  maps: 'https://maps.google.com/?q=Tarentaise+Savoie',
} as const

/**
 * Prima stagione invernale di lavoro in Tarentaise (2021 = inverno 2021/22).
 * Da qui il sito calcola da solo gli "anni di esperienza": aumentano di uno a ogni
 * inizio stagione (1° novembre), senza toccare i testi.
 */
export const FIRST_SEASON = 2021

/** Stagioni di lavoro fino a oggi (quella in corso compresa). */
export function seasonsTaught(now = new Date()) {
  const season = now.getMonth() >= 10 ? now.getFullYear() : now.getFullYear() - 1
  return season - FIRST_SEASON + 1
}

/**
 * Email del modulo contatti, spedite da functions/api/contact.ts (Cloudflare Pages) con Resend.
 * L'indirizzo mittente deve stare su un dominio verificato in Resend (vedi DA-FARE.md);
 * non serve che sia una casella vera: le risposte vanno sempre a CONTACT.email.
 * La chiave di Resend NON va qui (sarebbe pubblica): si imposta su Cloudflare come RESEND_API_KEY.
 * Se l'invio non riesce, il sito apre l'app di posta del visitatore con il messaggio già scritto.
 */
export const MAIL = {
  from: 'prenotazioni@vallyski.com',
  /** Nome mostrato come mittente nelle email a Valentina */
  siteName: 'Sito Vally Ski',
} as const

/**
 * PERSONALIZZARE: codice di GoatCounter (https://www.goatcounter.com, statistiche senza cookie,
 * gratuite per siti personali). Es. 'vallyski' se la dashboard è vallyski.goatcounter.com.
 * Vuoto: nessuna statistica, nessuno script esterno.
 */
export const GOATCOUNTER = ''

/**
 * PERSONALIZZARE: dati per le note legali (in Francia obbligatorie per un sito professionale,
 * art. 1-1 LCEN). I campi vuoti compaiono nella pagina come "[da completare]".
 */
export const LEGAL = {
  /** Nome e cognome come registrati, con "EI" se entrepreneur individuel / micro-entrepreneur. */
  publisher: 'Valentina Bernardi',
  status: '', // es. 'Entrepreneur individuel (EI)'
  address: '', // indirizzo professionale
  siret: '', // 14 cifre
  vat: '', // partita IVA / n° TVA intracommunautaire, se esiste
  /** Hosting: nome, indirizzo e telefono, come richiesto dalla legge. */
  host: '', // es. 'Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, USA — +1 650 319 8930' (da verificare)
} as const
