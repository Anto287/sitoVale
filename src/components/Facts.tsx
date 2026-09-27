import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { REVIEWS } from '../data/reviews'
import { revealOnScroll, useGSAP, withMotion } from '../lib/gsap'
import { Count } from './Count'

export function Facts() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => withMotion(() => revealOnScroll('.fact', { y: 24, stagger: 0.12 })), { scope: ref })

  return (
    <section ref={ref} className="facts">
      <div className="wrap">
        <div className="fact">
          <b className="fig">
            <Count to={5} duration={1.4} />
          </b>
          <span>{t('facts.years')}</span>
        </div>
        <div className="fact">
          <b>IT · FR · EN</b>
          <span>{t('facts.languages')}</span>
        </div>
        <a className="fact" href="#recensioni">
          <b className="fig">
            <Count to={REVIEWS.length} duration={1.8} />
          </b>
          <span>{t('facts.reviews')}</span>
        </a>
      </div>
    </section>
  )
}
