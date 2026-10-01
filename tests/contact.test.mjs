/**
 * Test della funzione del modulo contatti (functions/api/contact.ts): funzionamento, ripiego e sicurezza.
 * Nessuna email parte davvero: le chiamate a Resend vengono intercettate.
 *
 *   npm test
 */
import assert from 'node:assert/strict'
import { beforeEach, describe, test } from 'node:test'
import { CONTACT, MAIL } from '../src/config.ts'
import { onRequestPost } from '../functions/api/contact.ts'

const SITE = 'https://www.vallyski.com'
const KEY = 're_chiave_di_prova_123'

/** Email "spedite" durante il test e risposta che dà Resend (ok o errore, anche per singola email). */
let outbox
let resendStatus
beforeEach(() => {
  outbox = []
  resendStatus = () => 200
})
globalThis.fetch = async (url, init) => {
  assert.equal(url, 'https://api.resend.com/emails', 'la funzione parla solo con Resend')
  assert.equal(init.headers.Authorization, `Bearer ${KEY}`)
  const mail = JSON.parse(init.body)
  outbox.push(mail)
  const status = resendStatus(mail)
  return new Response(status === 200 ? '{"id":"test"}' : '{"error":"test"}', { status })
}
// gli errori di Resend vengono scritti nel log di Cloudflare: qui non servono
console.error = () => {}

const valid = {
  lang: 'it',
  name: 'Mario Rossi',
  email: 'mario@example.com',
  phone: '+39 333 123 4567',
  lesson: 'children',
  level: 'intermediate',
  dates: '12 — 18 / 02',
  people: '2 adulti, 1 bambino di 7 anni',
  message: 'Prima volta in Francia.',
  botcheck: '',
}

async function post(body, { origin = SITE, env = { RESEND_API_KEY: KEY }, raw } = {}) {
  const request = new Request(`${SITE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) },
    body: raw ?? JSON.stringify(body),
  })
  const res = await onRequestPost({ request, env })
  const text = await res.text()
  return { status: res.status, body: JSON.parse(text), text }
}
const toValentina = () => outbox.find((m) => m.to[0] === CONTACT.email)
const toClient = () => outbox.find((m) => m.to[0] !== CONTACT.email)

describe('funzionamento', () => {
  test('richiesta valida: due email, mittente sul dominio, risposte incrociate', async () => {
    const res = await post(valid)
    assert.equal(res.status, 200)
    assert.deepEqual(res.body, { ok: true })
    assert.equal(outbox.length, 2)
    const v = toValentina()
    assert.equal(v.from, `${MAIL.siteName} <${MAIL.from}>`)
    assert.equal(v.reply_to, 'mario@example.com', 'Valentina risponde direttamente al cliente')
    const c = toClient()
    assert.deepEqual(c.to, ['mario@example.com'])
    assert.equal(c.from, `Valentina Bernardi <${MAIL.from}>`)
    assert.equal(c.reply_to, CONTACT.email, 'il cliente risponde a Valentina')
  })

  test('a Valentina arrivano tutti i dati e il messaggio, in italiano', async () => {
    await post({ ...valid, lang: 'fr' })
    const v = toValentina()
    for (const s of ['Mario Rossi', 'mario@example.com', '+39 333 123 4567', 'Bambini', 'Intermedio', '12 — 18 / 02', '2 adulti', 'Prima volta in Francia.', 'francese'])
      assert.ok(v.text.includes(s), `manca "${s}"`)
    assert.ok(v.html.includes('https://wa.me/393331234567'), 'link WhatsApp al numero del cliente')
  })

  for (const [lang, words, pdf] of [
    ['it', 'Ho ricevuto la tua richiesta', 'Condizioni-e-Cancellazioni.pdf'],
    ['en', "I've received your request", 'Terms-and-Cancellation-Policy.pdf'],
    ['fr', 'J’ai bien reçu votre demande', 'Conditions-et-Annulation.pdf'],
  ])
    test(`conferma al cliente in ${lang}, con le condizioni nella sua lingua`, async () => {
      await post({ ...valid, lang })
      const c = toClient()
      assert.ok(c.subject.startsWith(words))
      assert.ok(c.html.includes(pdf) && c.text.includes(pdf))
    })

  test('lingua sconosciuta → inglese; lezione e livello sconosciuti → valori di base', async () => {
    await post({ ...valid, lang: 'de', lesson: 'elicottero', level: 'pro' })
    assert.ok(toClient().subject.startsWith("I've received"))
    assert.ok(toValentina().text.includes('Lezione: Non so ancora'))
    assert.ok(toValentina().text.includes('Livello: Principiante'))
  })

  test('campi troppo lunghi vengono tagliati', async () => {
    await post({ ...valid, name: 'A'.repeat(500), message: 'm'.repeat(10_000) })
    assert.ok(!toValentina().text.includes('A'.repeat(81)), 'nome oltre 80 caratteri')
    assert.ok(!toValentina().text.includes('m'.repeat(3001)), 'messaggio oltre 3000 caratteri')
  })
})

describe('ripiego (il sito apre l’app di posta del visitatore)', () => {
  test('servizio non configurato (manca RESEND_API_KEY) → errore, nessuna email', async () => {
    const res = await post(valid, { env: {} })
    assert.equal(res.status, 503)
    assert.equal(res.body.ok, false)
    assert.equal(outbox.length, 0)
  })

  test('Resend non accetta l’email per Valentina → errore (il visitatore usa la sua posta)', async () => {
    resendStatus = () => 500
    const res = await post(valid)
    assert.equal(res.status, 502)
    assert.equal(res.body.ok, false)
  })

  test('arriva a Valentina ma non parte la conferma → successo comunque (la richiesta non è persa)', async () => {
    resendStatus = (mail) => (mail.to[0] === CONTACT.email ? 200 : 500)
    const res = await post(valid)
    assert.equal(res.status, 200)
    assert.equal(res.body.ok, true)
  })
})

describe('sicurezza', () => {
  test('richiesta da un altro sito → rifiutata', async () => {
    const res = await post(valid, { origin: 'https://sito-malevolo.example' })
    assert.equal(res.status, 403)
    assert.equal(outbox.length, 0)
  })

  test('bot che compila il campo trappola → finto successo, nessuna email', async () => {
    const res = await post({ ...valid, botcheck: 'on' })
    assert.equal(res.status, 200)
    assert.equal(outbox.length, 0)
  })

  test('email non valida, vuota o con trucchi per aggiungere destinatari → rifiutata', async () => {
    for (const email of ['', 'non-una-email', 'a@b', 'mario@example.com\nBcc: vittima@example.com', 'mario@example.com, vittima@example.com', '<x@y.com>', 123])
      assert.equal((await post({ ...valid, email })).status, 400, JSON.stringify(email))
    assert.equal(outbox.length, 0)
  })

  test('nome con a capo: non può aggiungere righe all’oggetto o alle intestazioni', async () => {
    await post({ ...valid, name: 'Mario\r\nBcc: vittima@example.com' })
    for (const m of outbox) assert.ok(!/[\r\n]/.test(m.subject), m.subject)
  })

  test('il destinatario di Valentina non è modificabile dalla richiesta', async () => {
    await post({ ...valid, to: 'attaccante@example.com', from: 'falso@example.com', reply_to: 'x@example.com' })
    assert.deepEqual(toValentina().to, [CONTACT.email])
    assert.equal(toValentina().from, `${MAIL.siteName} <${MAIL.from}>`)
    assert.equal(toClient().reply_to, CONTACT.email)
  })

  test('codice HTML o script nei campi → mostrato come testo, mai eseguito', async () => {
    await post({ ...valid, name: '<img src=x onerror=alert(1)>', message: '<script>alert(1)</script><a href="https://phishing.example">clicca</a>' })
    const html = toValentina().html
    assert.ok(!html.includes('<script>') && !html.includes('<img src=x') && !html.includes('href="https://phishing'))
    assert.ok(html.includes('&lt;script&gt;'))
  })

  test('il modulo non può spedire testi scelti da altri a indirizzi scelti da altri', async () => {
    await post({ ...valid, email: 'vittima@example.com', name: 'www.offerta-truffa.example', message: 'COMPRA ORA su offerta-truffa.example' })
    const c = toClient()
    assert.ok(!c.html.includes('COMPRA ORA') && !c.text.includes('COMPRA ORA'), 'il messaggio libero non va al destinatario')
    assert.ok(!c.html.includes('offerta-truffa') && !c.text.includes('offerta-truffa'), 'un "nome" che è un indirizzo web non viene ripetuto')
  })

  test('richieste malformate o enormi → rifiutate senza email', async () => {
    assert.equal((await post(null, { raw: '{non è json' })).status, 400)
    assert.equal((await post(null, { raw: 'x'.repeat(25_000) })).status, 413)
    assert.equal((await post({ ...valid, name: '   ' })).status, 400)
    assert.equal(outbox.length, 0)
  })

  test('la chiave di Resend non compare mai nelle risposte né nelle email', async () => {
    for (const res of [await post(valid), await post(valid, { origin: 'https://x.example' }), await post({ ...valid, email: 'x' })])
      assert.ok(!res.text.includes(KEY))
    for (const m of outbox) assert.ok(!JSON.stringify(m).includes(KEY))
  })

  test('la funzione risponde solo a POST (GET e altri metodi li rifiuta Cloudflare)', async () => {
    const mod = await import('../functions/api/contact.ts')
    assert.deepEqual(Object.keys(mod), ['onRequestPost'])
  })
})
