import type { CSSProperties, ImgHTMLAttributes } from 'react'
import { images, photoSrcSet, photoUrl, type PhotoKey } from '../lib/photos'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> & {
  photo: PhotoKey
  alt: string
  /** Quanto è larga la foto nella pagina: il browser sceglie da qui la versione da scaricare. */
  sizes: string
  /** Foto sopra la piega (hero): caricata subito e con priorità alta. */
  priority?: boolean
  /** Punto della foto da tenere quando viene ritagliata (object-position). */
  focus?: string
}

/**
 * Oltre 2× di densità una foto non si vede più nitida, pesa solo di più. Per gli schermi 3×
 * (molti telefoni) ogni misura viene ripetuta scalata di 2/3 sotto una media query sulla
 * risoluzione, così il browser sceglie la versione adatta a un 2×. Tutto in HTML: funziona
 * anche prima che parta il JavaScript. Es. "90vw" →
 * "(min-resolution: 2.5dppx) calc(90vw * 0.667), 90vw".
 */
function capSizes(sizes: string) {
  const entries = sizes.split(',').map((e) => e.trim())
  const capped = entries.map((entry) => {
    const m = entry.match(/^(.*?)(\S+)$/)!
    const cond = m[1].trim()
    return `${cond ? `${cond} and ` : ''}(min-resolution: 2.5dppx) calc(${m[2]} * 0.667)`
  })
  return [...capped, ...entries].join(', ')
}

/**
 * <img> responsive dalle WebP generate da `npm run images`.
 * Finché la foto non arriva si vede la sua anteprima sfocata (pochi byte, già nel JS),
 * quindi niente riquadri vuoti né salti di layout.
 */
export function Photo({ photo, alt, sizes, priority, focus, style, ...rest }: Props) {
  const img = images[photo]
  const files = img.files as [number, string][]
  const fallback = files[Math.min(1, files.length - 1)][0]
  const placeholder: CSSProperties = {
    backgroundImage: `url(${img.lqip})`,
    backgroundSize: 'cover',
    backgroundPosition: focus ?? 'center',
    objectPosition: focus,
  }
  return (
    <img
      src={photoUrl(photo, fallback)}
      srcSet={photoSrcSet(photo)}
      sizes={capSizes(sizes)}
      alt={alt}
      width={img.w}
      height={img.h}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      style={{ ...placeholder, ...style }}
      {...rest}
    />
  )
}
