import type { Language } from '../i18n'

export type Review = {
  id: string
  author: string
  source: 'Google' | 'Maison Sport'
  date: string | null
  rating: number
  original: { lang: Language | 'other'; text: string } | null
}

export const REVIEWS: readonly Review[] = [
  { id: 'lynne', author: 'Lynne A.', source: 'Maison Sport', rating: 5, date: '2026-02', original: null },
  { id: 'katrine', author: 'Katrine B.', source: 'Maison Sport', rating: 5, date: '2026-02', original: null },
  { id: 'rebecca', author: 'Rebecca Butler', source: 'Google', rating: 5, date: '2024-12', original: null },
  { id: 'fiona', author: 'Fiona B.', source: 'Maison Sport', rating: 5, date: '2025-04', original: null },
  {
    id: 'mary',
    author: 'Mary Kenny',
    source: 'Google',
    rating: 5,
    date: '2025-02',
    original: { lang: 'en', text: 'Amazing week of ski lessons for our group of 6 boys with Valentina! They loved her and had so much fun too ❤️' },
  },
  { id: 'richard', author: 'Richard Webster', source: 'Google', rating: 5, date: '2025-02', original: null },
  { id: 'claire', author: 'Claire R.', source: 'Maison Sport', rating: 5, date: '2025-02', original: null },
  { id: 'jamesP', author: 'James P.', source: 'Maison Sport', rating: 5, date: '2025-01', original: null },
  { id: 'kate', author: 'Kate Brunton', source: 'Google', rating: 5, date: '2024-04', original: null },
  { id: 'nicola', author: 'Nicola Gaden', source: 'Google', rating: 5, date: '2025-01', original: null },
  { id: 'janine', author: 'Janine Zager', source: 'Google', rating: 5, date: '2024-03', original: null },
  { id: 'jamesPowell', author: 'James Powell', source: 'Google', rating: 5, date: null, original: null },
  { id: 'lone', author: 'Lone Kondrup T.', source: 'Maison Sport', rating: 4.8, date: '2025-03', original: null },
]
