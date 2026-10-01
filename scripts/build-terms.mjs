/**
 * Genera "Condizioni e cancellazioni" in PDF, una per lingua, in public/docs/:
 *
 *   npm run terms
 *
 * Testi in scripts/terms-content.mjs, contatti da src/config.ts, nomi dei file da src/data/terms.ts.
 * Impaginazione in HTML con font e colori del sito, stampata in A4 su una pagina da Google Chrome
 * (deve essere installato; percorso diverso con la variabile CHROME).
 * I PDF generati vanno inclusi nel commit: la build del sito non li rigenera.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { CONTACT, SITE_URL } from '../src/config.ts'
import { TERMS_FILES } from '../src/data/terms.ts'
import { TERMS } from './terms-content.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const font = (file) => fs.readFileSync(path.join(ROOT, 'node_modules/@fontsource-variable', file)).toString('base64')
// font dentro l'HTML: Chrome non carica file locali da una pagina aperta da disco
const FONTS = `
@font-face{font-family:Bodoni;font-weight:400 900;src:url(data:font/woff2;base64,${font('bodoni-moda/files/bodoni-moda-latin-opsz-normal.woff2')}) format('woff2')}
@font-face{font-family:Jost;font-weight:100 900;src:url(data:font/woff2;base64,${font('jost/files/jost-latin-wght-normal.woff2')}) format('woff2')}`

const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
// francese: spazio indivisibile prima di : ; % ! ? (non vanno a capo da soli)
const text = (s, lng) => {
  let out = escape(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  if (lng === 'fr') out = out.replace(/ ([:;%!?])/g, ' $1')
  return out
}
const colon = (lng) => (lng === 'fr' ? '\u00a0:' : ':')
const items = (list, lng) => `<ul>${list.map(([k, v]) => `<li><b>${text(k, lng)}${colon(lng)}</b> ${text(v, lng)}</li>`).join('')}</ul>`
const TONES = ['ok', 'mid', 'no']

function page(lng) {
  const t = TERMS[lng]
  const x = (s) => text(s, lng)
  return `<!doctype html><html lang="${lng}"><head><meta charset="utf-8"><title>${x(t.title)} — Valentina Bernardi</title><style>
${FONTS}
@page{size:A4;margin:0}
*{box-sizing:border-box}
:root{--ink:#26262A;--soft:#625B60;--line:#E7DADB;--accent:#D6245F;--accent-text:#B3164C;--cipria:#F4E7E6}
html,body{margin:0}
body{width:210mm;height:297mm;padding:14mm 17mm 11mm;display:flex;flex-direction:column;font:390 9.6pt/1.5 Jost,Arial,sans-serif;color:var(--ink)}
b{font-weight:560}
.eyebrow{display:flex;align-items:center;gap:10px;margin:0 0 7px;font-size:7.6pt;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--soft)}
.eyebrow::before{content:"";width:26px;height:1px;background:var(--accent)}
header{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;padding-bottom:12px;border-bottom:2px solid var(--accent)}
h1{margin:0;font:400 25pt/1.05 Bodoni,serif;letter-spacing:-.01em}
.who{text-align:right;font-size:8.6pt;color:var(--soft)}
.who b{display:block;font:400 13pt/1.2 Bodoni,serif;color:var(--ink)}
h2{margin:12px 0 6px;padding-bottom:5px;border-bottom:1px solid var(--line);font:400 13.5pt/1.2 Bodoni,serif}
.boxes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:9px 0 6px}
.box{padding:8px 12px;background:var(--cipria);border-left:2px solid var(--accent)}
.box span{display:block;font-size:7.2pt;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--accent-text)}
.box b{font-size:10pt}
ul{margin:4px 0 0;padding:0;list-style:none}
li{position:relative;padding-left:14px;margin:4px 0}
li::before{content:"";position:absolute;left:0;top:.62em;width:5px;height:5px;background:var(--accent);transform:rotate(45deg)}
p{margin:4px 0 8px;color:var(--soft)}
table{width:100%;border-collapse:collapse;font-size:9pt}
th{padding:6px 9px;text-align:left;font-size:7pt;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--soft);border-bottom:1px solid var(--ink)}
td{padding:7px 9px;border-bottom:1px solid var(--line);vertical-align:middle}
td:first-child{width:36%}
.tag{display:inline-block;padding:2px 8px;border-radius:999px;font-size:7.4pt;font-weight:560;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.tag.ok{background:#E2F0E6;color:#1F6B3A}
.tag.mid{background:#FBEBD5;color:#93540D}
.tag.no{background:#F6D9DE;color:var(--accent-text)}
.spacer{flex:1;min-height:12px}
.contacts{display:grid;grid-template-columns:1fr 1fr 1.3fr;gap:12px;padding:10px 14px;background:var(--cipria)}
.contacts span{display:block;font-size:7pt;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--soft)}
.contacts b{font-size:9.6pt}
.accept{display:flex;justify-content:space-between;gap:20px;margin-top:10px;padding-top:9px;border-top:1px dashed var(--line);font-size:8.4pt;color:var(--soft)}
footer{display:flex;justify-content:space-between;margin-top:9px;font-size:7.6pt;color:var(--soft)}
</style></head><body>
<p class="eyebrow">${x(t.eyebrow)}</p>
<header><h1>${x(t.title)}</h1><div class="who">${x(t.role)}<b>Valentina Bernardi</b></div></header>

<h2>${x(t.booking.title)}</h2>
<div class="boxes">${t.booking.boxes.map(([k, v]) => `<div class="box"><span>${x(k)}</span><b>${x(v)}</b></div>`).join('')}</div>
${items(t.booking.items, lng)}

<h2>${x(t.cancellation.title)}</h2>
<p>${x(t.cancellation.intro)}</p>
<table><thead><tr>${t.cancellation.head.map((h) => `<th>${x(h)}</th>`).join('')}</tr></thead><tbody>
${t.cancellation.rows.map(([when, tag, what], i) => `<tr><td>${x(when)}</td><td><span class="tag ${TONES[i]}">${x(tag)}</span></td><td>${x(what)}</td></tr>`).join('\n')}
</tbody></table>

<h2>${x(t.weather.title)}</h2>
${items(t.weather.items, lng)}

<h2>${x(t.lateness.title)}</h2>
${items(t.lateness.items, lng)}

<div class="spacer"></div>
<div class="contacts">
  <div><span>${x(t.contacts[0])}</span><b>Valentina Bernardi</b></div>
  <div><span>${x(t.contacts[1])}</span><b>${escape(CONTACT.whatsappLabel)}</b></div>
  <div><span>${x(t.contacts[2])}</span><b>${escape(CONTACT.email)}</b></div>
</div>
<div class="accept"><span>${x(t.acceptance)}</span><span>${x(t.date)}${lng === 'fr' ? ' ' : ''}: ____ / ____ / ________</span></div>
<footer><span>Valentina Bernardi · ${x(t.role)}</span><span>${escape(SITE_URL.replace('https://', ''))}</span></footer>
</body></html>`
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vb-terms-'))
for (const [lng, file] of Object.entries(TERMS_FILES)) {
  const html = path.join(tmp, `${lng}.html`)
  const out = path.join(ROOT, 'public', file)
  fs.writeFileSync(html, page(lng))
  fs.mkdirSync(path.dirname(out), { recursive: true })
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${out}`, `file://${html}`], { stdio: 'ignore' })
  const pages = (fs.readFileSync(out, 'latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length
  console.log(`✓ public/${file} — ${pages} ${pages === 1 ? 'pagina' : 'pagine (attenzione: deve stare su una)'}, ${Math.round(fs.statSync(out).size / 1024)} KB`)
}
fs.rmSync(tmp, { recursive: true, force: true })
