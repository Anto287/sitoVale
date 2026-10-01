import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { seasonsTaught } from '../config'
import { REVIEWS } from '../data/reviews'
import { revealOnScroll, useGSAP, withMotion } from '../lib/gsap'

export function Facts() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => withMotion(() => revealOnScroll('.fact', { y: 24, stagger: 0.12 })), { scope: ref })

  return (
    <section ref={ref} className="facts">
      <div className="wrap">
        <div className="fact">
          {/* la pagina pre-generata può avere un anno in meno se la stagione è cominciata dopo la build */}
          <b className="fig" suppressHydrationWarning>
            {seasonsTaught()}
          </b>
          <span>{t('facts.years')}</span>
        </div>
        <div className="fact">
          <b>IT · FR · EN</b>
          <span>{t('facts.languages')}</span>
        </div>
        <a className="fact" href="#recensioni">
          <b className="fig">{REVIEWS.length}</b>
          <span>{t('facts.reviews')}</span>
        </a>
      </div>
    </section>
  )
}
