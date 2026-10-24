import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { CONTACT, TURNSTILE_SITE_KEY } from '../config'
import type { Language } from '../i18n'
import { track } from '../lib/analytics'
import { EASE_OUT, gsap, prefersReducedMotion, revealOnScroll, useGSAP, withMotion } from '../lib/gsap'
import { isValidEmail, normalizeEmail, suggestEmail } from '../lib/email'
import { CONTACT_LIMITS, FORM_LESSONS as LESSONS, FORM_LEVELS as LEVELS, type ContactRequest } from '../lib/lessons'
import { withBase } from '../site'
import { SplitHeading } from './SplitHeading'
import { TermsLink } from './TermsLink'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; name: string } | { kind: 'mailto'; href: string }

const SEND_TIMEOUT = 6000

type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

let turnstileScript: Promise<Turnstile> | null = null
function loadTurnstile() {
  turnstileScript ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')))
    script.onerror = () => reject(new Error('turnstile'))
    document.head.appendChild(script)
  })
  return turnstileScript
}

export function Contact() {
  const { t, i18n } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const shellHeight = useRef(0)
  const startedAt = useRef(0)
  const [emailError, setEmailError] = useState('')
  const [emailHint, setEmailHint] = useState<string | null>(null)
  const captchaRef = useRef<HTMLDivElement>(null)
  const captchaId = useRef<string | null>(null)
  const captchaToken = useRef('')

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || status.kind === 'sent') return
    const el = captchaRef.current
    if (!el) return
    let cancelled = false
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        loadTurnstile()
          .then((ts) => {
            if (cancelled || captchaId.current) return
            captchaId.current = ts.render(el, {
              sitekey: TURNSTILE_SITE_KEY,
              appearance: 'interaction-only',
              theme: 'dark',
              language: i18n.resolvedLanguage,
              callback: (token: string) => {
                captchaToken.current = token
              },
              'expired-callback': () => {
                captchaToken.current = ''
              },
            })
          })
          .catch(() => {})
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(el)
    return () => {
      cancelled = true
      io.disconnect()
      if (captchaId.current) window.turnstile?.remove(captchaId.current)
      captchaId.current = null
      captchaToken.current = ''
    }
  }, [status.kind, i18n.resolvedLanguage])

  const resetCaptcha = () => {
    captchaToken.current = ''
    if (captchaId.current) window.turnstile?.reset(captchaId.current)
  }

  const showEmailError = (message: string) => {
    setEmailError(message)
    const input = formRef.current?.querySelector<HTMLInputElement>('#f-mail')
    input?.focus()
  }

  useGSAP(
    () =>
      withMotion(() => {
        revealOnScroll('.eyebrow')
        revealOnScroll('.channels li', { y: 20, stagger: 0.08 })
      }),
    { scope: ref },
  )

  useGSAP(
    () => {
      if (status.kind !== 'sent') return
      shellRef.current!.querySelector<HTMLElement>('.form-done h3')?.focus({ preventScroll: true })
      if (prefersReducedMotion()) return
      gsap
        .timeline({ defaults: { ease: EASE_OUT } })
        .from(shellRef.current, { height: shellHeight.current, duration: 0.7, ease: 'power3.inOut', clearProps: 'height' }, 0)
        .from('.form-done-rule', { scaleX: 0, transformOrigin: '0% 50%', duration: 1.1 }, 0.2)
        .from('.form-done > :not(.form-done-rule)', { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.35)
    },
    { scope: shellRef, dependencies: [status.kind], revertOnUpdate: true },
  )

  const compose = (form: HTMLFormElement) => {
    const f = new FormData(form)
    const lesson = LESSONS.find(([id]) => id === f.get('lesson'))
    const level = LEVELS.find(([id]) => id === f.get('level'))
    const line = (label: string, value: FormDataEntryValue | null | undefined) => (value ? `${label}: ${value}` : null)
    return [
      line(t('form.name'), f.get('name')),
      line(t('form.email'), f.get('email')),
      line(t('form.phone').replace(/\s*\(.*\)$/, ''), f.get('phone')),
      line(t('form.lesson'), lesson && t(lesson[1])),
      line(t('form.level'), level && t(level[1])),
      line(t('form.dates'), f.get('dates')),
      line(t('form.people'), f.get('people')),
      f.get('message') ? `\n${f.get('message')}` : null,
    ]
      .filter(Boolean)
      .join('\n')
  }

  const showSent = (name: string) => {
    shellHeight.current = shellRef.current!.offsetHeight
    if (prefersReducedMotion()) return setStatus({ kind: 'sent', name })
    gsap.to(formRef.current!.children, {
      y: -14,
      autoAlpha: 0,
      duration: 0.35,
      stagger: 0.04,
      ease: 'power2.in',
      onComplete: () => setStatus({ kind: 'sent', name }),
    })
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const field = (key: keyof typeof CONTACT_LIMITS | 'lesson' | 'level' | 'botcheck') => String(f.get(key) ?? '').trim()
    const request: ContactRequest = {
      lang: (i18n.resolvedLanguage ?? 'en') as Language,
      name: field('name'),
      email: normalizeEmail(field('email')),
      phone: field('phone'),
      lesson: field('lesson') as ContactRequest['lesson'],
      level: field('level') as ContactRequest['level'],
      dates: field('dates'),
      people: field('people'),
      message: field('message'),
      botcheck: field('botcheck'),
      elapsed: Date.now() - startedAt.current,
      turnstile: captchaToken.current,
    }

    if (!isValidEmail(request.email)) return showEmailError(t('form.emailInvalid'))

    setStatus({ kind: 'sending' })
    const timer = new AbortController()
    const timeout = window.setTimeout(() => timer.abort(), SEND_TIMEOUT)
    try {
      const res = await fetch(withBase('api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: timer.signal,
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (data.error === 'invalid-email') {
        resetCaptcha()
        setStatus({ kind: 'idle' })
        return showEmailError(t('form.emailNotFound'))
      }
      if (!res.ok || !data.ok) throw new Error('contact')
      track('modulo-inviato')
      showSent(request.name.split(' ')[0])
    } catch {
      const href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(`${t('form.mailSubject')} · ${request.name}`)}&body=${encodeURIComponent(compose(form))}`
      window.location.href = href
      track('modulo-email')
      setStatus({ kind: 'mailto', href })
    } finally {
      window.clearTimeout(timeout)
      resetCaptcha()
    }
  }

  const onWhatsapp = () => {
    const form = formRef.current!
    if (!form.reportValidity()) return
    track('modulo-whatsapp')
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(compose(form))}`, '_blank', 'noopener')
  }

  const reset = () => {
    shellHeight.current = shellRef.current!.offsetHeight
    setStatus({ kind: 'idle' })
  }

  useGSAP(
    () => {
      if (status.kind !== 'idle' || !shellHeight.current) return
      const form = formRef.current!
      form.reset()
      form.querySelector('input')?.focus({ preventScroll: true })
      if (prefersReducedMotion()) return
      gsap.from(form.children, { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: EASE_OUT, clearProps: 'all' })
    },
    { scope: shellRef, dependencies: [status.kind] },
  )

  const sending = status.kind === 'sending'

  return (
    <section ref={ref} className="section contact" id="contatti">
      <div className="wrap contact-grid">
        <div>
          <p className="eyebrow">{t('contact.eyebrow')}</p>
          <SplitHeading text={t('contact.title')} />
          <p className="lede">{t('contact.lede')}</p>
          <ul className="channels">
            <li>
              <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-4A8 8 0 1 1 20 12z" />
                </svg>
                <b>WhatsApp</b>
                <span>{CONTACT.whatsappLabel}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <b>Email</b>
                <span>{CONTACT.emailLabel}</span>
              </a>
            </li>
            <li>
              <a href={CONTACT.instagram} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1" />
                </svg>
                <b>Instagram</b>
                <span>{CONTACT.instagramLabel}</span>
              </a>
            </li>
            <li>
              <a href={CONTACT.maps} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <b>Tarentaise</b>
                <span>{t('contact.location')}</span>
              </a>
            </li>
          </ul>
          <p className="contact-note">{t('booking.note')}</p>
          <TermsLink className="terms-link" />
        </div>

        <div ref={shellRef} className="form-shell">
          {status.kind === 'sent' ? (
            <div className="form-done" role="status">
              <i className="form-done-rule" aria-hidden="true" />
              <h3 tabIndex={-1}>{t('form.sentTitle')}</h3>
              <p>{t('form.sentText', { name: status.name })}</p>
              <button type="button" className="form-alt" onClick={reset}>
                {t('form.sendAnother')} <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} aria-busy={sending} aria-describedby="form-required">
              <p className="form-intro" id="form-required">{t('form.requiredNote')}</p>
              <div className="row">
                <label htmlFor="f-name">
                  <span>{t('form.name')} <span aria-hidden="true">*</span></span>
                  <span className="control">
                    <input id="f-name" name="name" type="text" autoComplete="name" maxLength={CONTACT_LIMITS.name} required />
                  </span>
                </label>
                <label htmlFor="f-mail">
                  <span>{t('form.email')} <span aria-hidden="true">*</span></span>
                  <span className="control">
                    <input
                      id="f-mail"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      maxLength={CONTACT_LIMITS.email}
                      required
                      aria-invalid={emailError ? true : undefined}
                      aria-describedby={emailError || emailHint ? 'f-mail-help' : undefined}
                      onInput={() => {
                        setEmailError('')
                        setEmailHint(null)
                      }}
                      onBlur={(e) => setEmailHint(suggestEmail(e.currentTarget.value))}
                      onInvalid={(e) => {
                        e.preventDefault()
                        showEmailError(t(e.currentTarget.validity.valueMissing ? 'form.emailMissing' : 'form.emailInvalid'))
                      }}
                    />
                  </span>
                  {(emailError || emailHint) && (
                    <small className={`field-help${emailError ? ' is-error' : ''}`} id="f-mail-help" role={emailError ? 'alert' : undefined}>
                      {emailError || (
                        <>
                          {t('form.emailSuggest')}{' '}
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              const input = formRef.current!.querySelector<HTMLInputElement>('#f-mail')!
                              input.value = emailHint!
                              setEmailHint(null)
                              input.focus()
                            }}
                          >
                            {emailHint}
                          </button>
                          ?
                        </>
                      )}
                    </small>
                  )}
                </label>
              </div>
              <div className="row">
                <label htmlFor="f-phone">
                  <span>{t('form.phone')}</span>
                  <span className="control">
                    <input id="f-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={CONTACT_LIMITS.phone} placeholder={t('form.phPhone')} />
                  </span>
                </label>
                <label htmlFor="f-lesson">
                  <span>{t('form.lesson')}</span>
                  <span className="control select">
                    <select id="f-lesson" name="lesson" defaultValue="unsure">
                      {LESSONS.map(([id, key]) => (
                        <option key={id} value={id}>
                          {t(key)}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>
              </div>
              <div className="row">
                <label htmlFor="f-level">
                  <span>{t('form.level')}</span>
                  <span className="control select">
                    <select id="f-level" name="level">
                      {LEVELS.map(([id, key]) => (
                        <option key={id} value={id}>
                          {t(key)}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>
                <label htmlFor="f-dates">
                  <span>{t('form.dates')}</span>
                  <span className="control">
                    <input id="f-dates" name="dates" type="text" maxLength={CONTACT_LIMITS.dates} placeholder={t('form.phDates')} />
                  </span>
                </label>
              </div>
              <label htmlFor="f-people">
                <span>{t('form.people')}</span>
                <span className="control">
                  <input id="f-people" name="people" type="text" maxLength={CONTACT_LIMITS.people} placeholder={t('form.phPeople')} />
                </span>
              </label>
              <label htmlFor="f-msg">
                <span>{t('form.message')}</span>
                <span className="control">
                  <textarea id="f-msg" name="message" rows={3} maxLength={CONTACT_LIMITS.message} placeholder={t('form.phMessage')} />
                </span>
              </label>
              <input className="form-trap" type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              {TURNSTILE_SITE_KEY && <div ref={captchaRef} className="form-captcha" />}
              <div className="form-actions">
                <button className="btn btn--accent" type="submit" disabled={sending}>
                  <span>{sending ? t('form.sending') : t('form.send')}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M5 12h13m-5-6 6 6-6 6" />
                  </svg>
                </button>
                <button className="form-alt" type="button" onClick={onWhatsapp} disabled={sending}>
                  {t('form.orWhatsapp')} <span aria-hidden="true">→</span>
                </button>
              </div>
              <p className={`form-note${status.kind === 'mailto' ? ' is-error' : ''}`} role="status" aria-live="polite">
                {status.kind === 'mailto' && (
                  <>
                    {t('form.mailtoNote')} <a href={status.href}>{CONTACT.email}</a>
                  </>
                )}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
