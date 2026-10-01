import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { seasonsTaught } from '../config'
import { gsap, revealImages, revealOnScroll, useGSAP, withMotion } from '../lib/gsap'
import { Photo } from './Photo'
import { SplitHeading } from './SplitHeading'

export function About() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const years = seasonsTaught()

  useGSAP(
    () =>
      withMotion(() => {
        revealImages('.frame', { stagger: 0.18 })
        // solo l'etichetta entra: paragrafi e credenziali sono subito leggibili
        revealOnScroll('.eyebrow')
        // Le due foto scorrono a velocità diverse: profondità senza esagerare.
        gsap.to('.frame--sq', {
          yPercent: -14,
          ease: 'none',
          scrollTrigger: { trigger: '.stack', start: 'top bottom', end: 'bottom top', scrub: true },
        })
      }),
    { scope: ref },
  )

  return (
    <section ref={ref} className="section" id="chi">
      <div className="wrap split">
        <div className="split-media">
          <div className="stack">
            <div className="frame frame--tall">
              <Photo photo="valentina/pista-bastoncini-rosa" alt={t('about.imgPiste')} sizes="(max-width: 860px) 52vw, 330px" />
            </div>
            <div className="frame frame--sq">
              <Photo photo="valentina/ritratto-casco" alt={t('about.imgPortrait')} sizes="(max-width: 860px) 38vw, 245px" />
            </div>
          </div>
        </div>
        <div>
          <p className="eyebrow">{t('about.eyebrow')}</p>
          <SplitHeading text={t('about.title')} />
          <p className="lede" suppressHydrationWarning>
            {t('about.p1', { years })}
          </p>
          <p>{t('about.p2')}</p>
          <ul className="creds">
            <li>{t('about.cred1')}</li>
            <li suppressHydrationWarning>{t('about.cred2', { years })}</li>
            <li>{t('about.cred3')}</li>
            <li>{t('about.cred4')}</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
