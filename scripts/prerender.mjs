import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')
const SSR = path.join(ROOT, 'dist-ssr')

const { render, LANGUAGES, langSegment, urlFor, SITE_URL, IS_FINAL_URL, GOATCOUNTER, TURNSTILE_SITE_KEY } = await import(path.join(SSR, 'entry-server.js'))
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')

const OG_LOCALE = { en: 'en_GB', it: 'it_IT', fr: 'fr_FR' }
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const url = urlFor

const noindex = IS_FINAL_URL ? [] : ['<meta name="robots" content="noindex">']
if (!IS_FINAL_URL) console.log(`ℹ indirizzo provvisorio ${SITE_URL}: pagine con noindex`)

const alternates = [
  ...LANGUAGES.map((l) => `<link rel="alternate" hreflang="${l}" href="${url(l)}">`),
  `<link rel="alternate" hreflang="x-default" href="${url('en')}">`,
].join('\n')

const inlineScripts = new Set()

for (const lng of LANGUAGES) {
  const { html, title, description, translation } = await render(lng)
  const head = [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}">`,
    `<link rel="canonical" href="${url(lng)}">`,
    ...noindex,
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
    .replace('<!--app-->', () => html)
    .replace('</head>', () => `<script type="application/json" id="vb-i18n">${JSON.stringify({ lng, translation }).replaceAll('<', '\\u003c')}</script>\n</head>`)

  for (const [, code] of page.matchAll(/<script>([\s\S]*?)<\/script>/g)) inlineScripts.add(code)

  const out = path.join(DIST, langSegment(lng), 'index.html')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, page)
  console.log(`✓ ${path.relative(ROOT, out).padEnd(20)} ${Math.round(page.length / 1024)} KB — ${title}`)
}

const notFound = fs
  .readFileSync(path.join(DIST, 'index.html'), 'utf8')
  .replace(/<meta name="robots" content="noindex">\n?/, '')
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Page not found — Vally Ski</title>')
  .replace('<meta name="description"', '<meta name="robots" content="noindex">\n<meta name="description"')
fs.writeFileSync(path.join(DIST, '404.html'), notFound)
console.log('✓ 404.html')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGUAGES.map(
  (lng) => `  <url>
    <loc>${url(lng)}</loc>
${[...LANGUAGES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l)}"/>`), `    <xhtml:link rel="alternate" hreflang="x-default" href="${url('en')}"/>`].join('\n')}
  </url>`,
).join('\n')}
</urlset>
`
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap)
fs.writeFileSync(
  path.join(DIST, 'robots.txt'),
  IS_FINAL_URL ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n',
)
console.log('✓ sitemap.xml, robots.txt')

const hashes = [...inlineScripts].map((code) => `'sha256-${crypto.createHash('sha256').update(code).digest('base64')}'`)
const stats = GOATCOUNTER && IS_FINAL_URL
const csp = [
  "default-src 'self'",
  ['script-src', "'self'", ...hashes, stats && 'https://gc.zgo.at', TURNSTILE_SITE_KEY && 'https://challenges.cloudflare.com'].filter(Boolean).join(' '),
  TURNSTILE_SITE_KEY && 'frame-src https://challenges.cloudflare.com',
  "style-src 'self' 'unsafe-inline'",
  ['img-src', "'self'", 'data:', stats && `https://${GOATCOUNTER}.goatcounter.com`].filter(Boolean).join(' '),
  "font-src 'self'",
  ['connect-src', "'self'", stats && `https://${GOATCOUNTER}.goatcounter.com`].filter(Boolean).join(' '),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
]
  .filter(Boolean)
  .join('; ')
const headersFile = path.join(DIST, '_headers')
fs.writeFileSync(headersFile, fs.readFileSync(headersFile, 'utf8').replace('__CSP__', () => csp))
console.log(`✓ _headers: Content-Security-Policy con ${hashes.length} script interni`)

fs.rmSync(SSR, { recursive: true, force: true })
