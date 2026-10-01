import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { EASE_OUT, gsap, revealOnScroll, useGSAP, withMotion } from '../lib/gsap'
import { SplitHeading } from './SplitHeading'
import { TermsLink } from './TermsLink'

/** Tariffe: nessun listino, solo l'invito a scrivere (richiesta della cliente). */
export function Booking() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () =>
      withMotion(() => {
        revealOnScroll('.eyebrow')
        gsap.from('.booking-cta', {
          y: 24,
          autoAlpha: 0,
          duration: 1.1,
          ease: EASE_OUT,
          scrollTrigger: { trigger: '.booking-cta', start: 'top 92%', once: true },
          clearProps: 'transform',
        })
        // La linea fucsia si disegna da sinistra mentre la sezione entra.
        gsap.from('.booking-rule', {
          scaleX: 0,
          transformOrigin: '0% 50%',
          ease: EASE_OUT,
          duration: 1.6,
          scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
        })
      }),
    { scope: ref },
  )

  return (
    <section ref={ref} className="section booking" id="tariffe">
      <div className="wrap">
        <div className="booking-grid">
          <div>
            <p className="eyebrow">{t('booking.eyebrow')}</p>
            <SplitHeading text={t('booking.title')} style={{ maxWidth: '18ch' }} />
            <p className="lede">{t('booking.lede')}</p>
          </div>
          <a className="btn btn--accent booking-cta" href="#contatti" data-magnetic>
            <span>{t('booking.cta')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M5 12h13m-5-6 6 6-6 6" />
            </svg>
          </a>
        </div>
        <i className="booking-rule" aria-hidden="true" />
        <div className="booking-foot">
          <p className="booking-note">{t('booking.note')}</p>
          <TermsLink className="terms-link" />
        </div>
      </div>
    </section>
  )
}
