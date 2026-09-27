/**
 * Ultimo passo di `npm run build`: genera una pagina HTML completa per lingua
 *   dist/index.html (inglese)   dist/it/index.html   dist/fr/index.html
 * più sitemap.xml e robots.txt. Titolo, descrizione, canonical, hreflang e anteprime
 * social sono nella lingua di ogni pagina; il contenuto è già scritto nell'HTML.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')
const SSR = path.join(ROOT, 'dist-ssr')

const { render, LANGUAGES, pathFor, SITE_URL } = await import(path.join(SSR, 'entry-server.js'))
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')

const OG_LOCALE = { en: 'en_GB', it: 'it_IT', fr: 'fr_FR' }
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const url = (lng) => SITE_URL + pathFor(lng)

const alternates = [
  ...LANGUAGES.map((l) => `<link rel="alternate" hreflang="${l}" href="${url(l)}">`),
  `<link rel="alternate" hreflang="x-default" href="${url('en')}">`,
].join('\n')

for (const lng of LANGUAGES) {
  const { html, title, description } = await render(lng)
  const head = [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}">`,
    `<link rel="canonical" href="${url(lng)}">`,
    alternates,
    `<meta property="og:title" content="${escape(title)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:url" content="${url(lng)}">`,
    `<meta property="og:locale" content="${OG_LOCALE[lng]}">`,
    ...LANGUAGES.filter((l) => l !== lng).map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`),
  ].join('\n')

  const page = template
    .replace(/<html lang="[^"]*"/, `<html lang="${lng}"`)
    .replace(/<!--lang-head-->[\s\S]*?<!--\/lang-head-->/, head)
    .replace('<!--app-->', html)

  const out = path.join(DIST, pathFor(lng), 'index.html')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, page)
  console.log(`✓ ${path.relative(ROOT, out).padEnd(20)} ${Math.round(page.length / 1024)} KB — ${title}`)
}

// GitHub Pages mostra 404.html per gli indirizzi che non esistono: la home in inglese,
// con un titolo che lo dice e senza indicizzazione.
const notFound = fs
  .readFileSync(path.join(DIST, 'index.html'), 'utf8')
  .replace('<meta name="description"', '<meta name="robots" content="noindex">\n<meta name="description"')
fs.writeFileSync(path.join(DIST, '404.html'), notFound)
console.log('✓ 404.html')

// lastmod = data della build: dice a Google quando il sito è stato aggiornato l'ultima volta.
const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGUAGES.map(
  (lng) => `  <url>
    <loc>${url(lng)}</loc>
    <lastmod>${today}</lastmod>
${[...LANGUAGES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l)}"/>`), `    <xhtml:link rel="alternate" hreflang="x-default" href="${url('en')}"/>`].join('\n')}
  </url>`,
).join('\n')}
</urlset>
`
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap)
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
console.log(`✓ sitemap.xml (lastmod ${today}), robots.txt`)

fs.rmSync(SSR, { recursive: true, force: true })
