import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { seasonsTaught } from '../config'
import { REVIEWS } from '../data/reviews'
import { revealOnScroll, useGSAP, withMotion } from '../lib/gsap'
import { Stars } from './Reviews'

export function Facts() {
  const { t, i18n } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const average = REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length
  const rating = new Intl.NumberFormat(i18n.resolvedLanguage, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(average)

  useGSAP(() => withMotion(() => revealOnScroll('.fact', { y: 18, stagger: 0.1, start: 'top 95%' })), { scope: ref })

  return (
    <section ref={ref} className="facts" aria-label={t('facts.label')}>
      <div className="wrap facts-row">
        <div className="fact">
          <b className="fig" suppressHydrationWarning>
            {seasonsTaught()}
          </b>
          <span>{t('facts.years')}</span>
        </div>
        <div className="fact">
          <b className="fig">3</b>
          <span>
            {t('facts.languages')}
            <small>IT · FR · EN</small>
          </span>
        </div>
        <a className="fact" href="#recensioni">
          <b className="fig">{rating}</b>
          <span>
            <Stars rating={average} />
            {t('facts.reviews', { count: REVIEWS.length })}
          </span>
        </a>
      </div>
    </section>
  )
}
