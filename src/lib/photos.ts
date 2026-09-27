import images from '../data/images.json'
import { withBase } from '../site'

/** Nome di una foto generata da `npm run images`, es. "valentina/cresta". */
export type PhotoKey = keyof typeof images

/** URL della versione più vicina (per eccesso) alla larghezza richiesta. */
export function photoUrl(photo: PhotoKey, width: number) {
  const files = images[photo].files as [number, string][]
  return withBase((files.find(([w]) => w >= width) ?? files[files.length - 1])[1])
}

export const photoSrcSet = (photo: PhotoKey) =>
  (images[photo].files as [number, string][]).map(([w, url]) => `${withBase(url)} ${w}w`).join(', ')

export { images }
