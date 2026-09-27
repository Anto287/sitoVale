import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { revealOnScroll, useGSAP, withMotion } from '../lib/gsap'
import { Photo } from './Photo'
import { SplitHeading } from './SplitHeading'

const LESSONS = [
  { id: 'private', photo: 'lezioni/curva', focus: 'center 35%' },
  { id: 'children', photo: 'lezioni/bambini', focus: 'center 40%' },
  { id: 'group', photo: 'lezioni/gruppo', focus: 'center 45%' },
] as const

export function Lessons() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () =>
      withMotion(() => {
        revealOnScroll('.eyebrow')
        revealOnScroll('.card', { y: 80, stagger: 0.12, start: 'top 92%' })
      }),
    { scope: ref },
  )

  return (
    <section ref={ref} className="section section--alt" id="lezioni">
      <div className="wrap">
        <p className="eyebrow">{t('lessons.eyebrow')}</p>
        <SplitHeading text={t('lessons.title')} style={{ maxWidth: '20ch' }} />
        <div className="cards">
          {LESSONS.map(({ id, photo, focus }) => (
            <article className="card" key={id}>
              <div className="card-img">
                <Photo photo={photo} alt={t(`lessons.${id}.imgAlt`)} focus={focus} sizes="(max-width: 620px) 90vw, (max-width: 960px) 45vw, 380px" />
              </div>
              <div className="card-body">
                <h3>{t(`lessons.${id}.title`)}</h3>
                <p>{t(`lessons.${id}.text`)}</p>
                <a className="card-link" href="#contatti">
                  {t('lessons.cta')} <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
