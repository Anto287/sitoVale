import type { CSSProperties, ImgHTMLAttributes } from 'react'
import { images, photoSrcSet, photoUrl, type PhotoKey } from '../lib/photos'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> & {
  photo: PhotoKey
  alt: string
  sizes: string
  priority?: boolean
  focus?: string
}

function capSizes(sizes: string) {
  const entries = sizes.split(',').map((e) => e.trim())
  const capped = entries.map((entry) => {
    const m = entry.match(/^(.*?)(\S+)$/)!
    const cond = m[1].trim()
    return `${cond ? `${cond} and ` : ''}(min-resolution: 2.5dppx) calc(${m[2]} * 0.667)`
  })
  return [...capped, ...entries].join(', ')
}

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
