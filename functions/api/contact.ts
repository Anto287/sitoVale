import { CONTACT, MAIL, SITE_URL } from '../../src/config.ts'
import { TERMS_FILES } from '../../src/data/terms.ts'
import type { Language } from '../../src/i18n/index.ts'
import en from '../../src/i18n/locales/en.json' with { type: 'json' }
import fr from '../../src/i18n/locales/fr.json' with { type: 'json' }
import it from '../../src/i18n/locales/it.json' with { type: 'json' }
import { emailDomain, isDisposableEmail, isValidEmail, normalizeEmail } from '../../src/lib/email.ts'
import { CONTACT_LIMITS, FORM_LESSONS, FORM_LEVELS, MIN_FILL_TIME, type ContactRequest } from '../../src/lib/lessons.ts'

type Env = { RESEND_API_KEY?: string; TURNSTILE_SECRET_KEY?: string }

const LOCALES = { en, it, fr }
const LANGS = Object.keys(LOCALES) as Language[]
const tr = (lng: Language, key: string) => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], LOCALES[lng]) as string

const CONFIRM = {
  it: {
    subject: 'Ho ricevuto la tua richiesta · Valentina Bernardi',
    hello: 'Ciao {name},',
    helloNoName: 'Ciao,',
    intro: 'grazie per avermi scritto! Ho ricevuto la tua richiesta di lezione e ti rispondo al più presto con disponibilità e tariffa.',
    recap: 'La tua richiesta',
    terms: 'Prima di prenotare puoi leggere le condizioni di prenotazione e cancellazione:',
    questions: 'Per qualsiasi domanda rispondi a questa email o scrivimi su WhatsApp al {whatsapp}.',
    bye: 'A presto sulla neve,',
    why: 'Ricevi questa email perché hai compilato il modulo contatti su {site}.',
  },
  en: {
    subject: "I've received your request · Valentina Bernardi",
    hello: 'Hi {name},',
    helloNoName: 'Hi,',
    intro: "thank you for getting in touch! I've received your lesson request and I'll get back to you soon with availability and rates.",
    recap: 'Your request',
    terms: 'Before booking, you can read the booking and cancellation terms:',
    questions: 'If you have any questions, just reply to this email or message me on WhatsApp at {whatsapp}.',
    bye: 'See you on the snow,',
    why: "You're receiving this email because you filled in the contact form on {site}.",
  },
  fr: {
    subject: 'J’ai bien reçu votre demande · Valentina Bernardi',
    hello: 'Bonjour {name},',
    helloNoName: 'Bonjour,',
    intro: 'merci pour votre message ! J’ai bien reçu votre demande de cours et je vous réponds au plus vite avec mes disponibilités et le tarif.',
    recap: 'Votre demande',
    terms: 'Avant de réserver, vous pouvez consulter les conditions de réservation et d’annulation :',
    questions: 'Pour toute question, répondez simplement à cet email ou écrivez-moi sur WhatsApp au {whatsapp}.',
    bye: 'À bientôt sur les pistes,',
    why: 'Vous recevez cet email car vous avez rempli le formulaire de contact sur {site}.',
  },
} satisfies Record<Language, Record<string, string>>

const LANGUAGE_NAMES: Record<Language, string> = { it: 'italiano', en: 'inglese', fr: 'francese' }

const clean = (v: unknown, max: number) =>
  typeof v === 'string'
    ? v
        // oxlint-disable-next-line no-control-regex -- è proprio lo scopo: togliere i caratteri di controllo
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .trim()
        .slice(0, max)
    : ''
const oneLine = (v: unknown, max: number) => clean(v, max).replace(/\s+/g, ' ')

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  } })

async function readBody(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) return ''
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > 20_000) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(bytes)
}

const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const typo = (s: string, lng: Language) => (lng === 'fr' ? s.replace(/ ([:;!?])/g, ' $1') : s)
const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '')

type Row = [label: string, html: string]

function layout(lng: Language, body: string, footer: string) {
  return `<!doctype html><html lang="${lng}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F4F4">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4F4"><tr><td align="center" style="padding:28px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-top:3px solid #D6245F">
<tr><td style="padding:30px 30px 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#26262A">Valentina Bernardi</td></tr>
<tr><td style="padding:0 30px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#26262A">${body}</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px"><tr><td style="padding:16px 30px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#7A7277">${footer}</td></tr></table>
</td></tr></table></body></html>`
}

function rowsHtml(rows: Row[]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;border-top:1px solid #E7DADB">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:9px 12px 9px 0;border-bottom:1px solid #E7DADB;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#625B60;vertical-align:top;white-space:nowrap">${escape(k)}</td><td style="padding:9px 0;border-bottom:1px solid #E7DADB;vertical-align:top">${v}</td></tr>`,
    )
    .join('')}</table>`
}

const rowsText = (rows: [string, string][]) => rows.map(([k, v]) => `${k}: ${v}`).join('\n')

async function send(key: string, mail: Record<string, unknown>, timeout = 8_000) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(mail),
      signal: AbortSignal.timeout(timeout),
    })
    if (!res.ok) console.error('Contact email delivery failed', res.status)
    return res.ok
  } catch {
    console.error('Contact email delivery unavailable')
    return false
  }
}


const WINDOW = 10 * 60_000
const MAX_PER_IP = 4
const CONFIRM_EVERY = 60 * 60_000
const byIp = new Map<string, number[]>()
const confirmedAt = new Map<string, number>()

function prune(now: number) {
  if (byIp.size > 1000) for (const [ip, times] of byIp) if (times.every((t) => now - t > WINDOW)) byIp.delete(ip)
  if (confirmedAt.size > 1000) for (const [email, t] of confirmedAt) if (now - t > CONFIRM_EVERY) confirmedAt.delete(email)
}

function tooManyRequests(ip: string | null, now: number) {
  if (!ip) return false
  const times = (byIp.get(ip) ?? []).filter((t) => now - t < WINDOW)
  times.push(now)
  byIp.set(ip, times)
  return times.length > MAX_PER_IP
}

function looksLikeSpam(...fields: string[]) {
  const text = fields.join(' ')
  const links = text.match(/https?:\/\/|www\.|\[url|<a\s/gi)?.length ?? 0
  return links > 2
}

async function dnsHas(name: string, type: 'MX' | 'A' | 'AAAA') {
  const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
    headers: { Accept: 'application/dns-json' },
    signal: AbortSignal.timeout(1_000),
  })
  if (!res.ok) throw new Error('dns')
  const data = (await res.json()) as { Status: number; Answer?: { type: number }[] }
  if (data.Status === 3) return false
  if (data.Status !== 0) throw new Error('dns')
  const code = { MX: 15, A: 1, AAAA: 28 }[type]
  return (data.Answer ?? []).some((a) => a.type === code)
}

async function canReceiveEmail(domain: string) {
  try {
    const answers = await Promise.all([dnsHas(domain, 'MX'), dnsHas(domain, 'A'), dnsHas(domain, 'AAAA')])
    return answers.some(Boolean)
  } catch {
    return true
  }
}

async function humanVerified(secret: string | undefined, token: unknown, ip: string | null) {
  if (!secret) return true
  if (typeof token !== 'string' || !token || token.length > 2048) return false
  try {
    const form = new FormData()
    form.append('secret', secret)
    form.append('response', token)
    if (ip) form.append('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form, signal: AbortSignal.timeout(1_500) })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}

export async function onRequestPost(context: { request: Request; env: Env; waitUntil?: (promise: Promise<unknown>) => void }) {
  const { request, env } = context
  const origin = request.headers.get('Origin')
  if (origin !== SITE_URL || new URL(request.url).origin !== SITE_URL) return json(403, { ok: false })
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json(415, { ok: false })
  if (!env.RESEND_API_KEY) return json(503, { ok: false, error: 'not-configured' })

  let body: Partial<Record<keyof ContactRequest, unknown>>
  try {
    const raw = await readBody(request)
    if (raw === null) return json(413, { ok: false })
    body = JSON.parse(raw)
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json(400, { ok: false })
  } catch {
    return json(400, { ok: false })
  }

  if (body.botcheck) return json(200, { ok: true })
  if (typeof body.elapsed !== 'number' || body.elapsed < MIN_FILL_TIME) return json(200, { ok: true })

  const now = Date.now()
  prune(now)
  const ip = request.headers.get('CF-Connecting-IP')
  if (!(await humanVerified(env.TURNSTILE_SECRET_KEY, body.turnstile, ip))) return json(403, { ok: false, error: 'captcha' })

  const L = CONTACT_LIMITS
  const lng = LANGS.includes(body.lang as Language) ? (body.lang as Language) : 'en'
  const r = {
    name: oneLine(body.name, L.name),
    email: normalizeEmail(oneLine(body.email, L.email)),
    phone: oneLine(body.phone, L.phone),
    dates: oneLine(body.dates, L.dates),
    people: oneLine(body.people, L.people),
    message: clean(body.message, L.message),
    lesson: FORM_LESSONS.find(([id]) => id === body.lesson) ?? FORM_LESSONS[3],
    level: FORM_LEVELS.find(([id]) => id === body.level) ?? FORM_LEVELS[0],
  }
  if (!r.name) return json(400, { ok: false, error: 'invalid' })
  if (!isValidEmail(r.email) || isDisposableEmail(r.email)) return json(400, { ok: false, error: 'invalid-email' })
  if (looksLikeSpam(r.name, r.dates, r.people, r.message)) return json(200, { ok: true })
  if (!(await canReceiveEmail(emailDomain(r.email)))) return json(400, { ok: false, error: 'invalid-email' })
  if (tooManyRequests(ip, now)) return json(429, { ok: false, error: 'rate-limited' })

  const site = SITE_URL.replace('https://', '')
  const label = (lang: Language, key: string) => tr(lang, key).replace(/\s*\(.*\)$/, '')

  const phoneDigits = r.phone.replace(/[^\d]/g, '')
  const all: Row[] = [
    [label('it', 'form.name'), escape(r.name)],
    [label('it', 'form.email'), `<a href="mailto:${escape(r.email)}" style="color:#B3164C">${escape(r.email)}</a>`],
    ...(r.phone
      ? [[label('it', 'form.phone'), `${escape(r.phone)}${phoneDigits.length >= 8 ? ` · <a href="https://wa.me/${phoneDigits}" style="color:#B3164C">WhatsApp</a>` : ''}`] as Row]
      : []),
    [label('it', 'form.lesson'), escape(tr('it', r.lesson[1]))],
    [label('it', 'form.level'), escape(tr('it', r.level[1]))],
    ...(r.dates ? [[label('it', 'form.dates'), escape(r.dates)] as Row] : []),
    ...(r.people ? [[label('it', 'form.people'), escape(r.people)] as Row] : []),
    ['Lingua del sito', LANGUAGE_NAMES[lng]],
  ]
  const toValentina = {
    from: `${MAIL.siteName} <${MAIL.from}>`,
    to: [CONTACT.email],
    reply_to: r.email,
    subject: `Nuova richiesta dal sito · ${r.name}`,
    html: layout(
      'it',
      `<p style="margin:0 0 12px">Nuova richiesta di lezione dal sito.</p>${rowsHtml(all)}${
        r.message ? `<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#625B60">${escape(label('it', 'form.message'))}</p><p style="margin:0 0 18px;white-space:pre-wrap">${escape(r.message)}</p>` : ''
      }<p style="margin:0;color:#625B60">Rispondi a questa email per scrivere direttamente a ${escape(r.name)}.</p>`,
      `Inviata dal modulo contatti di ${escape(site)}. A ${escape(r.name)} viene inviata anche una conferma automatica.`,
    ),
    text: `Nuova richiesta di lezione dal sito.\n\n${rowsText([
      [label('it', 'form.name'), r.name],
      [label('it', 'form.email'), r.email],
      ...(r.phone ? [[label('it', 'form.phone'), r.phone] as [string, string]] : []),
      [label('it', 'form.lesson'), tr('it', r.lesson[1])],
      [label('it', 'form.level'), tr('it', r.level[1])],
      ...(r.dates ? [[label('it', 'form.dates'), r.dates] as [string, string]] : []),
      ...(r.people ? [[label('it', 'form.people'), r.people] as [string, string]] : []),
      ['Lingua del sito', LANGUAGE_NAMES[lng]],
    ])}${r.message ? `\n\n${r.message}` : ''}\n\nRispondi a questa email per scrivere direttamente a ${r.name}.`,
  }
  if (!(await send(env.RESEND_API_KEY, toValentina, 3_000))) return json(502, { ok: false })

  const c = CONFIRM[lng]
  const first = r.name.split(' ')[0]
  const hello = /^[\p{L}'’-]{1,40}$/u.test(first) ? fill(c.hello, { name: first }) : c.helloNoName
  const recap: [string, string][] = [
    [label(lng, 'form.lesson'), tr(lng, r.lesson[1])],
    [label(lng, 'form.level'), tr(lng, r.level[1])],
  ]
  const termsUrl = `${SITE_URL}/${TERMS_FILES[lng]}`
  const vars = { whatsapp: CONTACT.whatsappLabel, site }
  const confirmation = {
    from: `Valentina Bernardi <${MAIL.from}>`,
    to: [r.email],
    reply_to: CONTACT.email,
    subject: typo(c.subject, lng),
    html: layout(
      lng,
      `<p style="margin:0 0 12px">${escape(hello)}</p>
<p style="margin:0 0 18px">${escape(typo(c.intro, lng))}</p>
<p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#B3164C">${escape(c.recap)}</p>
${rowsHtml(recap.map(([k, v]) => [k, escape(v)]))}
<p style="margin:0 0 6px">${escape(typo(c.terms, lng))}</p>
<p style="margin:0 0 18px"><a href="${escape(termsUrl)}" style="color:#B3164C;font-weight:bold">${escape(tr(lng, 'terms.link'))} (PDF)</a></p>
<p style="margin:0 0 18px">${escape(typo(fill(c.questions, vars), lng))}</p>
<p style="margin:0">${escape(c.bye)}<br>Valentina</p>`,
      `Valentina Bernardi · ${escape(tr(lng, 'footer.role'))} · <a href="${escape(SITE_URL)}" style="color:#7A7277">${escape(site)}</a><br>${escape(typo(fill(c.why, vars), lng))}`,
    ),
    text: `${hello}\n\n${typo(c.intro, lng)}\n\n${c.recap}\n${rowsText(recap)}\n\n${typo(c.terms, lng)}\n${termsUrl}\n\n${typo(fill(c.questions, vars), lng)}\n\n${c.bye}\nValentina\n\n—\nValentina Bernardi · ${tr(lng, 'footer.role')} · ${site}\n${typo(fill(c.why, vars), lng)}`,
  }
  if (now - (confirmedAt.get(r.email) ?? 0) < CONFIRM_EVERY) return json(200, { ok: true })
  confirmedAt.set(r.email, now)
  const confirmationSend = send(env.RESEND_API_KEY, confirmation)
  if (context.waitUntil) context.waitUntil(confirmationSend)
  else await confirmationSend

  return json(200, { ok: true })
}
