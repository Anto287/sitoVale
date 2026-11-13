// Sugli schermi molto densi (≥ 2.5x) chiede immagini a 2/3 della larghezza: stessa resa, meno byte.
// Usata da <Photo> e dal preload dell'immagine di apertura: i due `sizes` devono coincidere,
// altrimenti il browser scarica due file diversi.
export function capSizes(sizes: string) {
  const entries = sizes.split(',').map((e) => e.trim())
  const capped = entries.map((entry) => {
    const m = entry.match(/^(.*?)(\S+)$/)!
    const cond = m[1].trim()
    return `${cond ? `${cond} and ` : ''}(min-resolution: 2.5dppx) calc(${m[2]} * 0.667)`
  })
  return [...capped, ...entries].join(', ')
}
