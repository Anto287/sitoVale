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
  whatsapp: '3889397424',
  whatsappLabel: '+39 388 939 7424',
  email: 'bernardivale46@gmail.com',
  emailLabel: 'bernardivale46@gmail.com',
  instagram: 'https://instagram.com/vally.it',
  instagramLabel: 'vally.it',
  maps: 'https://maps.google.com/?q=Tarentaise+Savoie',
} as const

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
  host: '', // es. 'Netlify, Inc. — 512 2nd Street, Suite 200, San Francisco, CA 94107, USA'
} as const
