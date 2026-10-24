import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { describe, test } from 'node:test'

const DIST = path.resolve(import.meta.dirname, '../dist')
const read = (f) => fs.readFileSync(path.join(DIST, f), 'utf8')
const PAGES = ['index.html', 'it/index.html', 'fr/index.html', '404.html']

function files(dir = DIST) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? files(p) : [path.relative(DIST, p)]
  })
}

function headersFor(rule) {
  const out = {}
  let active = false
  for (const line of read('_headers').split('\n')) {
    if (/^\S/.test(line) && !line.startsWith('#')) active = line.trim() === rule
    else if (active && /^\s+\S+:/.test(line)) {
      const i = line.indexOf(':')
      out[line.slice(0, i).trim()] = line.slice(i + 1).trim()
    }
  }
  return out
}

describe('intestazioni di sicurezza (_headers per Cloudflare)', () => {
  const all = headersFor('/*')
  const csp = Object.fromEntries((all['Content-Security-Policy'] ?? '').split(';').map((d) => d.trim().split(/\s+/)).map(([k, ...v]) => [k, v]))

  test('Content-Security-Policy completa (nessun segnaposto rimasto)', () => {
    assert.ok(all['Content-Security-Policy'], 'manca la CSP')
    assert.ok(!read('_headers').includes('__CSP__'))
  })

  test('gli script ammessi sono solo quelli del sito, niente "unsafe-inline" né "unsafe-eval"', () => {
    assert.ok(csp['script-src'].includes("'self'"))
    assert.ok(!csp['script-src'].includes("'unsafe-inline'") && !csp['script-src'].includes("'unsafe-eval'"))
    assert.ok(!csp['script-src'].includes('*') && !csp['script-src'].includes('https:'))
  })

  test('ogni script scritto nelle pagine è autorizzato dalla sua impronta', () => {
    for (const page of PAGES)
      for (const [, code] of read(page).matchAll(/<script>([\s\S]*?)<\/script>/g)) {
        const hash = `'sha256-${createHash('sha256').update(code).digest('base64')}'`
        assert.ok(csp['script-src'].includes(hash), `${page}: script interno non autorizzato`)
      }
  })

  test('il modulo può scrivere solo al sito stesso; nessun riquadro esterno; niente plugin', () => {
    assert.deepEqual(csp['connect-src'].filter((s) => s !== "'self'" && !s.endsWith('.goatcounter.com') && s !== 'https://cloudflareinsights.com'), [])
    assert.deepEqual(csp['frame-ancestors'], ["'none'"])
    assert.deepEqual(csp['object-src'], ["'none'"])
    assert.deepEqual(csp['base-uri'], ["'self'"])
  })

  test('altre protezioni presenti', () => {
    assert.equal(all['X-Frame-Options'], 'DENY')
    assert.equal(all['X-Content-Type-Options'], 'nosniff')
    assert.match(all['Strict-Transport-Security'] ?? '', /max-age=\d{7,}/)
    assert.ok(all['Referrer-Policy'] && all['Permissions-Policy'])
  })

  test('gli indirizzi provvisori di Cloudflare (*.pages.dev) non vengono indicizzati', () => {
    assert.equal(headersFor('https://:project.pages.dev/*')['X-Robots-Tag'], 'noindex')
    assert.equal(headersFor('https://:version.:project.pages.dev/*')['X-Robots-Tag'], 'noindex')
  })
})

describe('nessun segreto nei file pubblicati', () => {
  const text = files().filter((f) => /\.(html|js|css|json|txt|xml|webmanifest|_headers)$|_headers$/.test(f))

  test('nessuna chiave di servizi (Resend, Web3Forms, token)', () => {
    for (const f of text) {
      const s = read(f)
      assert.ok(!/re_[A-Za-z0-9]{16,}/.test(s), `${f}: sembra una chiave Resend`)
      assert.ok(!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(s), `${f}: sembra una chiave (UUID)`)
      assert.ok(!/RESEND_API_KEY|api\.resend\.com|web3forms/i.test(s), `${f}: riferimento al servizio email nel sito pubblico`)
    }
  })

  test('nessun file sorgente o di configurazione finito tra quelli pubblicati', () => {
    for (const f of files()) assert.ok(!/(^|\/)(\.env|.*\.ts|.*\.tsx|.*\.map|package(-lock)?\.json)$/.test(f), f)
  })
})

describe('pagine', () => {
  test('canonical, hreflang e social puntano al dominio definitivo in tutte le lingue', () => {
    const origin = 'https://www.vallyski.com'
    for (const [page, suffix] of [['index.html', '/'], ['it/index.html', '/it/'], ['fr/index.html', '/fr/']]) {
      const html = read(page)
      assert.ok(html.includes(`<link rel="canonical" href="${origin}${suffix}">`), page)
      assert.ok(html.includes(`<meta property="og:url" content="${origin}${suffix}">`), page)
      for (const [lang, segment] of [['en', '/'], ['it', '/it/'], ['fr', '/fr/'], ['x-default', '/']])
        assert.ok(html.includes(`hreflang="${lang}" href="${origin}${segment}"`), `${page}: ${lang}`)
      assert.ok(!/<meta name="robots" content="noindex/.test(html), `${page}: produzione non indicizzabile`)
    }
  })

  test('sitemap e robots contengono solo i tre indirizzi canonici, senza date di modifica artificiali', () => {
    assert.deepEqual([...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]), [
      'https://www.vallyski.com/', 'https://www.vallyski.com/it/', 'https://www.vallyski.com/fr/',
    ])
    assert.ok(!read('sitemap.xml').includes('<lastmod>'))
    assert.match(read('robots.txt'), /Allow: \/\n/)
    assert.match(read('robots.txt'), /Sitemap: https:\/\/www\.vallyski\.com\/sitemap\.xml/)
  })

  test('404 esiste e chiede esplicitamente di non essere indicizzata', () => {
    assert.match(read('404.html'), /<title>Page not found — Vally Ski<\/title>/)
    assert.match(read('404.html'), /<meta name="robots" content="noindex">/)
  })

  test('asset e pagine locali referenziati dall’HTML esistono nel risultato della build', () => {
    for (const page of PAGES)
      for (const [, href] of read(page).matchAll(/(?:href|src)="(\/[^"#?]*)[^"]*"/g)) {
        if (href.startsWith('//')) continue
        const target = path.join(DIST, decodeURIComponent(href))
        assert.ok(fs.existsSync(target), `${page}: ${href}`)
        if (fs.statSync(target).isDirectory()) assert.ok(fs.existsSync(path.join(target, 'index.html')), href)
      }
  })

  test('ogni lingua ha il suo HTML completo, con lingua e testi giusti', () => {
    for (const [page, lang] of [['index.html', 'en'], ['it/index.html', 'it'], ['fr/index.html', 'fr']]) {
      const html = read(page)
      assert.match(html, new RegExp(`<html lang="${lang}"`))
      assert.match(html, /<h1>/)
      assert.ok(html.includes(`"lng":"${lang}"`), `${page}: testi della lingua mancanti`)
    }
  })

  test('i link esterni che aprono una nuova scheda sono protetti (noopener)', () => {
    for (const page of PAGES)
      for (const [a] of read(page).matchAll(/<a [^>]*target="_blank"[^>]*>/g)) assert.match(a, /rel="[^"]*noopener/, `${page}: ${a}`)
  })

  test('i PDF delle condizioni linkati dalle pagine esistono', () => {
    for (const page of PAGES)
      for (const [, href] of read(page).matchAll(/href="\/(docs\/[^"]+\.pdf)"/g)) assert.ok(fs.existsSync(path.join(DIST, href)), href)
  })
})
