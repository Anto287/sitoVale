import type { CSSProperties, ImgHTMLAttributes } from 'react'
import { images, photoSrcSet, photoUrl, type PhotoKey } from '../lib/photos'
import { capSizes } from '../lib/sizes'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> & {
  photo: PhotoKey
  alt: string
  sizes: string
  priority?: boolean
  focus?: string
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
