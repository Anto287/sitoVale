import type { Language } from '../i18n'

/**
 * Recensioni reali di clienti, da Google e Maison Sport.
 *
 * Ogni recensione va mostrata nella lingua in cui è stata scritta, uguale per tutti i visitatori:
 * basta compilare `original` con il testo esatto (su Google: "Visualizza originale";
 * su Maison Sport: "Mostra originale"). Finché manca, il sito usa la traduzione nella lingua
 * del visitatore (src/i18n/locales/*.json → reviews.items.<id>) con l'etichetta "Tradotta".
 *
 * `date`: mese della visita (Google) o data della recensione (Maison Sport), AAAA-MM.
 */
export type Review = {
  id: string
  author: string
  source: 'Google' | 'Maison Sport'
  date: string | null
  original: { lang: Language | 'other'; text: string } | null
}

export const REVIEWS: readonly Review[] = [
  { id: 'lynne', author: 'Lynne A.', source: 'Maison Sport', date: '2026-02', original: null },
  { id: 'katrine', author: 'Katrine B.', source: 'Maison Sport', date: '2026-02', original: null },
  { id: 'rebecca', author: 'Rebecca Butler', source: 'Google', date: '2024-12', original: null },
  { id: 'fiona', author: 'Fiona B.', source: 'Maison Sport', date: '2025-04', original: null },
  {
    id: 'mary',
    author: 'Mary Kenny',
    source: 'Google',
    date: '2025-02',
    original: { lang: 'en', text: 'Amazing week of ski lessons for our group of 6 boys with Valentina! They loved her and had so much fun too ❤️' },
  },
  { id: 'richard', author: 'Richard Webster', source: 'Google', date: '2025-02', original: null },
  { id: 'claire', author: 'Claire R.', source: 'Maison Sport', date: '2025-02', original: null },
  { id: 'jamesP', author: 'James P.', source: 'Maison Sport', date: '2025-01', original: null },
  { id: 'kate', author: 'Kate Brunton', source: 'Google', date: '2024-04', original: null },
  { id: 'nicola', author: 'Nicola Gaden', source: 'Google', date: '2025-01', original: null },
  { id: 'janine', author: 'Janine Zager', source: 'Google', date: '2024-03', original: null },
  { id: 'jamesPowell', author: 'James Powell', source: 'Google', date: null, original: null },
  { id: 'lone', author: 'Lone Kondrup T.', source: 'Maison Sport', date: '2025-03', original: null },
]
