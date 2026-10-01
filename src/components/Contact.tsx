import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { CONTACT } from '../config'
import type { Language } from '../i18n'
import { track } from '../lib/analytics'
import { EASE_OUT, gsap, prefersReducedMotion, revealOnScroll, useGSAP, withMotion } from '../lib/gsap'
import { CONTACT_LIMITS, FORM_LESSONS as LESSONS, FORM_LEVELS as LEVELS, type ContactRequest } from '../lib/lessons'
import { withBase } from '../site'
import { SplitHeading } from './SplitHeading'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; name: string } | { kind: 'mailto'; href: string }

/**
 * Oltre questo tempo si rinuncia e si apre l'app di posta. Sotto i 5 s: dopo, il browser
 * considera il clic su "Invia" troppo lontano e potrebbe non aprire l'app.
 */
const SEND_TIMEOUT = 4500

export function Contact() {
  const { t, i18n } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  // altezza del riquadro prima del cambio modulo ↔ conferma, per animare il passaggio
  const shellHeight = useRef(0)

  useGSAP(
    () =>
      withMotion(() => {
        revealOnScroll('.eyebrow')
        revealOnScroll('.channels li', { y: 20, stagger: 0.08 })
      }),
    { scope: ref },
  )

  // Conferma: il riquadro passa dall'altezza del modulo a quella del messaggio,
  // la lineetta fucsia si disegna, poi titolo e testo salgono.
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

  // Il testo della richiesta, uguale per email e WhatsApp.
  const compose = (form: HTMLFormElement) => {
    const f = new FormData(form)
    const lesson = LESSONS.find(([id]) => id === f.get('lesson'))
    const level = LEVELS.find(([id]) => id === f.get('level'))
    const line = (label: string, value: FormDataEntryValue | null | undefined) => (value ? `${label}: ${value}` : null)
    return [
      line(t('form.name'), f.get('name')),
      line(t('form.email'), f.get('email')),
      // nell'email basta "Telefono", senza "(facoltativo)"
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

  // Il modulo esce (campi che svaniscono in cascata), poi compare la conferma.
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

  // La richiesta parte dal sito (functions/api/contact.ts su Cloudflare, email dal dominio con Resend).
  // Se non riesce, per qualsiasi motivo, si apre l'app di posta del visitatore con il messaggio già scritto.
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const field = (key: keyof typeof CONTACT_LIMITS | 'lesson' | 'level' | 'botcheck') => String(f.get(key) ?? '').trim()
    const request: ContactRequest = {
      lang: (i18n.resolvedLanguage ?? 'en') as Language,
      name: field('name'),
      email: field('email'),
      phone: field('phone'),
      lesson: field('lesson') as ContactRequest['lesson'],
      level: field('level') as ContactRequest['level'],
      dates: field('dates'),
      people: field('people'),
      message: field('message'),
      botcheck: field('botcheck'),
    }

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
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean }
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
    }
  }

  // Stessa richiesta su WhatsApp. Il browser controlla prima i campi obbligatori.
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

  // dopo "Invia un'altra richiesta" il modulo rientra vuoto
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
            <form ref={formRef} onSubmit={onSubmit} aria-busy={sending}>
              <div className="row">
                <label htmlFor="f-name">
                  <span>{t('form.name')}</span>
                  <input id="f-name" name="name" type="text" autoComplete="name" maxLength={CONTACT_LIMITS.name} required />
                </label>
                <label htmlFor="f-mail">
                  <span>{t('form.email')}</span>
                  <input id="f-mail" name="email" type="email" autoComplete="email" inputMode="email" maxLength={CONTACT_LIMITS.email} required />
                </label>
              </div>
              <div className="row">
                <label htmlFor="f-phone">
                  <span>{t('form.phone')}</span>
                  <input id="f-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={CONTACT_LIMITS.phone} placeholder={t('form.phPhone')} />
                </label>
                <label htmlFor="f-lesson">
                  <span>{t('form.lesson')}</span>
                  <select id="f-lesson" name="lesson" defaultValue="unsure">
                    {LESSONS.map(([id, key]) => (
                      <option key={id} value={id}>
                        {t(key)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="row">
                <label htmlFor="f-level">
                  <span>{t('form.level')}</span>
                  <select id="f-level" name="level">
                    {LEVELS.map(([id, key]) => (
                      <option key={id} value={id}>
                        {t(key)}
                      </option>
                    ))}
                  </select>
                </label>
                <label htmlFor="f-dates">
                  <span>{t('form.dates')}</span>
                  <input id="f-dates" name="dates" type="text" maxLength={CONTACT_LIMITS.dates} placeholder={t('form.phDates')} />
                </label>
              </div>
              <label htmlFor="f-people">
                <span>{t('form.people')}</span>
                <input id="f-people" name="people" type="text" maxLength={CONTACT_LIMITS.people} placeholder={t('form.phPeople')} />
              </label>
              <label htmlFor="f-msg">
                <span>{t('form.message')}</span>
                <textarea id="f-msg" name="message" rows={3} maxLength={CONTACT_LIMITS.message} placeholder={t('form.phMessage')} />
              </label>
              {/* trappola per i bot: invisibile e fuori dal tab */}
              <input className="form-trap" type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="form-actions">
                <button className="btn btn--accent" type="submit" data-magnetic disabled={sending}>
                  <span>{sending ? t('form.sending') : t('form.send')}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M5 12h13m-5-6 6 6-6 6" />
                  </svg>
                </button>
                <button className="form-alt" type="button" onClick={onWhatsapp}>
                  {t('form.orWhatsapp')} <span aria-hidden="true">→</span>
                </button>
              </div>
              <p className={`form-note${status.kind === 'mailto' ? ' is-error' : ''}`} role="status" aria-live="polite">
                {/* vuoto finché non serve: resta nella pagina perché gli screen reader leggano il messaggio */}
                {status.kind === 'mailto' && (
                  <>
                    {/* il link riapre l'app di posta con lo stesso messaggio già scritto */}
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
