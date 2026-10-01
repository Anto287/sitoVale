/** Le tre stazioni: nome, punto sulla mappa (TarentaiseMap) e posizione dell'etichetta. */
export type PlaceId = 'lesArcs' | 'valDisere' | 'tignes'

type Label = { lx: number; ly: number; anchor: 'start' | 'middle' | 'end' }

/** `compact`: posizione dell'etichetta sulla mappa per telefono, dove i nomi sono molto più grandi. */
export const RESORTS: ({ id: PlaceId; name: string; x: number; y: number; compact: Label } & Label)[] = [
  { id: 'lesArcs', name: 'Les Arcs', x: 338, y: 298, lx: 328, ly: 324, anchor: 'end', compact: { lx: 326, ly: 334, anchor: 'end' } },
  { id: 'valDisere', name: "Val d'Isère", x: 455, y: 421, lx: 472, ly: 428, anchor: 'start', compact: { lx: 482, ly: 476, anchor: 'middle' } },
  { id: 'tignes', name: 'Tignes', x: 403, y: 401, lx: 390, ly: 396, anchor: 'end', compact: { lx: 386, ly: 394, anchor: 'end' } },
]
