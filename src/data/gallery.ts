import type { PhotoKey } from '../lib/photos'

type GalleryAlt = 'gallery.smile' | 'gallery.ridge' | 'gallery.girl' | 'gallery.powder' | 'gallery.duo' | 'gallery.trees' | 'gallery.goggles' | 'gallery.pines' | 'gallery.bw'

export const GALLERY: { photo: PhotoKey; alt: GalleryAlt }[] = [
  { photo: 'valentina/ritratto-sorriso', alt: 'gallery.smile' },
  { photo: 'valentina/cresta', alt: 'gallery.ridge' },
  { photo: 'lezioni/bambina-pista', alt: 'gallery.girl' },
  { photo: 'valentina/neve-fresca', alt: 'gallery.powder' },
  { photo: 'lezioni/duo', alt: 'gallery.duo' },
  { photo: 'valentina/bosco', alt: 'gallery.trees' },
  { photo: 'valentina/ritratto-maschera', alt: 'gallery.goggles' },
  { photo: 'valentina/neve-fresca-pini', alt: 'gallery.pines' },
  { photo: 'valentina/ritratto-bn', alt: 'gallery.bw' },
]

export type GalleryView = { index: number; dir: 1 | -1 | 0 } | null
