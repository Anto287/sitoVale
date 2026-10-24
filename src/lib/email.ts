const COMMON_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'hotmail.it',
  'hotmail.fr',
  'hotmail.co.uk',
  'outlook.com',
  'outlook.it',
  'outlook.fr',
  'live.com',
  'live.it',
  'live.fr',
  'msn.com',
  'yahoo.com',
  'yahoo.it',
  'yahoo.fr',
  'yahoo.co.uk',
  'icloud.com',
  'me.com',
  'libero.it',
  'virgilio.it',
  'alice.it',
  'tiscali.it',
  'tim.it',
  'fastwebnet.it',
  'orange.fr',
  'free.fr',
  'sfr.fr',
  'laposte.net',
  'wanadoo.fr',
  'proton.me',
  'protonmail.com',
  'btinternet.com',
  'sky.com',
  'gmx.com',
  'gmx.de',
  'web.de',
  'tin.it',
  'inwind.it',
  'iol.it',
  'email.it',
  'aruba.it',
  'neuf.fr',
  'bbox.fr',
  'aol.com',
  'ymail.com',
  'mail.com',
  'mac.com',
  'sky.it',
  'zoho.com',
]

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'sharklasers.com',
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'trashmail.com',
  'getnada.com',
  'dispostable.com',
  'maildrop.cc',
  'throwawaymail.com',
  'fakeinbox.com',
  'mintemail.com',
  'mohmal.com',
  'emailondeck.com',
  'tempail.com',
  'burnermail.io',
  'spamgourmet.com',
  'mailnesia.com',
  'jetable.org',
  'mytemp.email',
  'tempmailo.com',
  'mail.tm',
  'moakt.com',
])

const LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export function emailDomain(email: string) {
  return email.slice(email.lastIndexOf('@') + 1)
}

export function isValidEmail(email: string) {
  if (email.length > 254) return false
  const at = email.lastIndexOf('@')
  if (at < 1 || at !== email.indexOf('@')) return false
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  if (local.length > 64 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return false
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false
  const labels = domain.split('.')
  if (labels.length < 2 || !labels.every((l) => LABEL.test(l))) return false
  return /^[a-z]{2,}$/.test(labels.at(-1)!)
}

export function isDisposableEmail(email: string) {
  const domain = emailDomain(email)
  return [...DISPOSABLE_DOMAINS].some((d) => domain === d || domain.endsWith(`.${d}`))
}

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = cur
    }
  }
  return row[b.length]
}

export function suggestEmail(value: string) {
  const email = normalizeEmail(value)
  const at = email.lastIndexOf('@')
  if (at < 1) return null
  const domain = email.slice(at + 1)
  if (!domain || COMMON_DOMAINS.includes(domain)) return null
  let best: string | null = null
  let bestScore = Infinity
  for (const candidate of COMMON_DOMAINS) {
    const score = distance(domain, candidate)
    if (score < bestScore) {
      best = candidate
      bestScore = score
    }
  }
  const limit = domain.length <= 6 ? 1 : 2
  return best && bestScore <= limit ? `${email.slice(0, at)}@${best}` : null
}
