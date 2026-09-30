import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { CONTACT } from '../config'
import { revealOnScroll, useGSAP, withMotion } from '../lib/gsap'
import { SplitHeading } from './SplitHeading'

const LEVELS = ['form.levelBeginner', 'form.levelIntermediate', 'form.levelAdvanced'] as const
const LESSONS = ['lessons.private.title', 'lessons.children.title', 'lessons.group.title', 'form.lessonUnsure'] as const

export function Contact() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [sent, setSent] = useState(false)

  useGSAP(
    () =>
      withMotion(() => {
        revealOnScroll('.eyebrow, .lede')
        revealOnScroll('.channels li', { y: 20, stagger: 0.08 })
        revealOnScroll('form > *', { y: 30, stagger: 0.09 })
      }),
    { scope: ref },
  )

  // Il testo della richiesta, uguale per email e WhatsApp.
  const compose = (form: HTMLFormElement) => {
    const f = new FormData(form)
    const line = (label: string, key: string) => (f.get(key) ? `${label}: ${f.get(key)}` : null)
    return [
      line(t('form.name'), 'name'),
      line(t('form.email'), 'email'),
      line(t('form.lesson'), 'lesson'),
      line(t('form.level'), 'level'),
      line(t('form.dates'), 'dates'),
      line(t('form.people'), 'people'),
      f.get('message') ? `\n${f.get('message')}` : null,
    ]
      .filter(Boolean)
      .join('\n')
  }

  // Sito statico: il form apre il programma di posta con il messaggio già compilato.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(t('form.mailSubject'))}&body=${encodeURIComponent(compose(e.currentTarget))}`
    setSent(true)
  }

  // Stessa richiesta su WhatsApp. Il browser controlla prima i campi obbligatori.
  const onWhatsapp = () => {
    const form = formRef.current!
    if (!form.reportValidity()) return
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(compose(form))}`, '_blank', 'noopener')
  }

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
        <form ref={formRef} onSubmit={onSubmit}>
          <div className="row">
            <label htmlFor="f-name">
              <span>{t('form.name')}</span>
              <input id="f-name" name="name" type="text" autoComplete="name" required />
            </label>
            <label htmlFor="f-mail">
              <span>{t('form.email')}</span>
              <input id="f-mail" name="email" type="email" autoComplete="email" inputMode="email" required />
            </label>
          </div>
          <div className="row">
            <label htmlFor="f-lesson">
              <span>{t('form.lesson')}</span>
              <select id="f-lesson" name="lesson">
                {LESSONS.map((key) => (
                  <option key={key}>{t(key)}</option>
                ))}
              </select>
            </label>
            <label htmlFor="f-level">
              <span>{t('form.level')}</span>
              <select id="f-level" name="level">
                {LEVELS.map((key) => (
                  <option key={key}>{t(key)}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="row">
            <label htmlFor="f-dates">
              <span>{t('form.dates')}</span>
              <input id="f-dates" name="dates" type="text" placeholder={t('form.phDates')} />
            </label>
            <label htmlFor="f-people">
              <span>{t('form.people')}</span>
              <input id="f-people" name="people" type="text" placeholder={t('form.phPeople')} />
            </label>
          </div>
          <label htmlFor="f-msg">
            <span>{t('form.message')}</span>
            <textarea id="f-msg" name="message" rows={3} placeholder={t('form.phMessage')} />
          </label>
          <div className="form-actions">
            <button className="btn btn--accent" type="submit" data-magnetic>
              <span>{t('form.send')}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M5 12h13m-5-6 6 6-6 6" />
              </svg>
            </button>
            <button className="form-alt" type="button" onClick={onWhatsapp}>
              {t('form.orWhatsapp')} <span aria-hidden="true">→</span>
            </button>
          </div>
          <p className="form-note" role="status" aria-live="polite">
            {/* vuoto finché non si invia: resta nella pagina perché gli screen reader leggano la conferma */}
            {sent && (
              <>
                {t('form.sent')} <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </>
            )}
          </p>
        </form>
      </div>
    </section>
  )
}
