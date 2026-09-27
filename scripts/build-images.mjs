/**
 * Converte le foto di photos/<cartella>/*.jpg in WebP responsive per il sito.
 *
 *   npm run images
 *
 * - public/images/<cartella>/<nome>-<larghezza>.<impronta>.webp   una versione per larghezza
 * - src/data/images.json      manifest: dimensioni, file, anteprima sfocata
 * - public/og-image.jpg       anteprima 1200×630 per i link condivisi
 * - public/icons/*            icone (schermata home iPhone/Android, Google) da public/favicon.svg
 *
 * L'impronta (hash del contenuto) nel nome permette ai browser di tenere le foto in cache
 * per un anno: se una foto cambia cambia anche il nome, quindi viene riscaricata subito.
 *
 * Le larghezze non superano mai l'originale: ingrandire non aggiunge dettaglio, solo peso.
 * Una foto già convertita e non modificata viene saltata.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'photos')
const OUT = path.join(ROOT, 'public/images')
const MANIFEST = path.join(ROOT, 'src/data/images.json')
// Anteprima dei link condivisi (WhatsApp, Facebook, iMessage…). La foto di gruppo ha l'originale
// più grande (2048 px): rimpicciolita a 1200 resta nitida, mentre quella della hero (1472 px, da WhatsApp)
// mostrava la grana della compressione. Sotto i 300 KB, oltre i quali WhatsApp può non mostrarla.
const OG = { photo: 'lezioni/gruppo', out: path.join(ROOT, 'public/og-image.jpg') }

const WIDTHS = [480, 800, 1200, 1600, 2048]
// 80 è il punto in cui il WebP è indistinguibile a occhio dall'originale sulle foto di neve;
// sotto, i cieli azzurri iniziano a fare "gradini" (banding).
const WEBP = { quality: 80, effort: 6, smartSubsample: true, preset: 'photo' }
// se cambiano le impostazioni, tutte le foto vengono rigenerate
const SETTINGS = JSON.stringify({ WIDTHS, WEBP, sharpen: 0.5 })

const previous = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {}
const manifest = {}
const produced = new Set()
let converted = 0

for (const category of fs.readdirSync(SRC).filter((d) => fs.statSync(path.join(SRC, d)).isDirectory()).sort()) {
  for (const file of fs.readdirSync(path.join(SRC, category)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort()) {
    const name = file.replace(/\.[^.]+$/, '')
    const key = `${category}/${name}`
    const src = path.join(SRC, category, file)
    const mtime = fs.statSync(src).mtimeMs

    // rotate() applica l'orientamento EXIF; l'output non porta metadati (niente GPS, niente modello di telefono)
    const meta = await sharp(src).rotate().metadata()
    const [w, h] = meta.orientation >= 5 ? [meta.height, meta.width] : [meta.width, meta.height]
    const widths = [...WIDTHS.filter((x) => x < w), Math.min(w, WIDTHS.at(-1))].filter((x, i, a) => a.indexOf(x) === i)
    const height = (x) => Math.round((h * x) / w)
    const cached = previous[key]
    if (cached && cached.mtime === mtime && cached.settings === SETTINGS && cached.files?.every(([, url]) => fs.existsSync(path.join(ROOT, 'public', url)))) {
      cached.files.forEach(([, url]) => produced.add(path.join(ROOT, 'public', url)))
      manifest[key] = cached
      continue
    }

    fs.mkdirSync(path.join(OUT, category), { recursive: true })
    const files = []
    for (const x of widths) {
      let img = sharp(src).rotate().resize({ width: x, kernel: 'lanczos3' })
      // un filo di nitidezza compensa l'ammorbidimento del ridimensionamento
      if (x < w) img = img.sharpen({ sigma: 0.5 })
      const buf = await img.webp(WEBP).toBuffer()
      const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8)
      const file = path.join(OUT, category, `${name}-${x}.${hash}.webp`)
      fs.writeFileSync(file, buf)
      produced.add(file)
      files.push(file)
    }
    const lqip = await sharp(src).rotate().resize({ width: 24 }).blur(1.2).webp({ quality: 45 }).toBuffer()

    manifest[key] = {
      w,
      h,
      files: widths.map((x, i) => [x, '/' + path.relative(path.join(ROOT, 'public'), files[i]).split(path.sep).join('/')]),
      heights: widths.map(height),
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
      mtime,
      settings: SETTINGS,
    }
    converted++
    const kb = files.map((f) => Math.round(fs.statSync(f).size / 1024))
    console.log(`✓ ${key.padEnd(34)} ${w}×${h} → ${widths.map((x, i) => `${x}w ${kb[i]}KB`).join(' · ')}`)
  }
}

// Via i file generati da foto che non esistono più.
for (const category of fs.existsSync(OUT) ? fs.readdirSync(OUT) : []) {
  const dir = path.join(OUT, category)
  if (!fs.statSync(dir).isDirectory()) continue
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f)
    if (f.endsWith('.webp') && !produced.has(full)) {
      fs.rmSync(full)
      console.log(`− rimosso ${path.relative(ROOT, full)}`)
    }
  }
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')

const og = Object.entries(manifest).find(([k]) => k === OG.photo)
const ogStale = !fs.existsSync(OG.out) || fs.statSync(OG.out).mtimeMs < Math.max(fs.statSync(path.join(SRC, `${OG.photo}.jpg`)).mtimeMs, fs.statSync(import.meta.filename).mtimeMs)
if (og && ogStale) {
  await sharp(path.join(SRC, `${OG.photo}.jpg`))
    .rotate()
    .resize(1200, 630, { fit: 'cover', position: 'attention', kernel: 'lanczos3' })
    // colore a piena risoluzione (4:4:4): bordi puliti tra neve e giacche scure
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(OG.out)
  console.log('✓ og-image.jpg 1200×630')
}

// ---------- icone, da public/favicon.svg ----------
const ICON_SRC = path.join(ROOT, 'public/favicon.svg')
const ICONS = path.join(ROOT, 'public/icons')
fs.mkdirSync(ICONS, { recursive: true })
const svg = fs.readFileSync(ICON_SRC, 'utf8')
// iOS e Android arrotondano da soli: per loro il riquadro deve essere pieno, senza angoli tondi
const fullBleed = Buffer.from(svg.replace(/rx="\d+"/, 'rx="0"'))
// "maskable": Android può ritagliare a cerchio, quindi il segno sta nel 70% centrale
const maskable = Buffer.from(svg.replace(/rx="\d+"/, 'rx="0"').replace('scale(1.16)', 'scale(0.9)'))
const icons = [
  ['favicon-48.png', Buffer.from(svg), 48],
  ['apple-touch-icon.png', fullBleed, 180],
  ['icon-192.png', fullBleed, 192],
  ['icon-512.png', fullBleed, 512],
  ['icon-maskable-512.png', maskable, 512],
]
const iconsStale = icons.some(([f]) => !fs.existsSync(path.join(ICONS, f)) || fs.statSync(path.join(ICONS, f)).mtimeMs < fs.statSync(ICON_SRC).mtimeMs)
if (iconsStale) {
  for (const [file, input, size] of icons) {
    await sharp(input, { density: Math.ceil((72 * size) / 64) * 2 }).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(ICONS, file))
  }
  console.log(`✓ icone: ${icons.map(([f]) => f).join(', ')}`)
}

console.log(`\n${Object.keys(manifest).length} foto, ${converted} convertite ora.`)
