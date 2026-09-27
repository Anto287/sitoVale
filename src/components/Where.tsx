import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { EASE_OUT, gsap, revealImages, revealOnScroll, useGSAP, withMotion } from '../lib/gsap'
import type { PhotoKey } from '../lib/photos'
import { Photo } from './Photo'
import { SplitHeading } from './SplitHeading'

const PLACES = [
  ['Les Arcs', 'where.lesArcs'],
  ["Val d'Isère", 'where.valDisere'],
  ['Tignes', 'where.tignes'],
] as const

const STRIP: { photo: PhotoKey; alt: string }[] = [
  { photo: 'panorami/bosco-innevato', alt: 'where.imgForest' },
  { photo: 'panorami/cabinovia-monte-bianco', alt: 'where.imgGondola' },
  { photo: 'panorami/seggiovia', alt: 'where.imgChairlift' },
  { photo: 'panorami/alba', alt: 'where.imgDawn' },
  { photo: 'panorami/larici', alt: 'where.imgLarches' },
  { photo: 'panorami/tramonto-pista', alt: 'where.imgSunset' },
]

export function Where() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () =>
      withMotion(() => {
        revealImages('.stack .frame', { stagger: 0.18 })
        revealOnScroll('.eyebrow, .lede')
        gsap.to('.frame--tall', {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: { trigger: '.stack', start: 'top bottom', end: 'bottom top', scrub: true },
        })

        // Le tre stazioni: riga che si disegna, poi nome e descrizione.
        gsap
          .timeline({ scrollTrigger: { trigger: '.places', start: 'top 85%', once: true } })
          .from('.places .rule', { scaleX: 0, transformOrigin: '0% 50%', duration: 1.2, ease: 'power4.inOut', stagger: 0.15 })
          .from('.places li > :not(.rule)', { y: 18, autoAlpha: 0, duration: 0.9, ease: EASE_OUT, stagger: 0.08 }, 0.3)

        // Striscia di panorami: scorre in orizzontale mentre si scende nella pagina.
        const strip = ref.current!.querySelector<HTMLElement>('.strip')!
        const track = strip.querySelector<HTMLElement>('.strip-track')!
        strip.classList.add('is-driven')
        gsap.fromTo(
          track,
          { x: () => Math.min(0, strip.clientWidth - track.scrollWidth) * 0.08 },
          {
            x: () => Math.min(0, strip.clientWidth - track.scrollWidth),
            ease: 'none',
            scrollTrigger: { trigger: strip, start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
          },
        )
        revealImages('.strip figure', { stagger: 0.08, start: 'top 95%' })
        return () => strip.classList.remove('is-driven')
      }),
    { scope: ref },
  )

  return (
    <section ref={ref} className="section where" id="dove">
      <div className="wrap split split--rev">
        <div className="split-media">
          <div className="stack">
            <div className="frame frame--sq">
              <Photo photo="panorami/mare-di-nuvole" alt={t('where.imgClouds')} sizes="(max-width: 860px) 42vw, 245px" />
            </div>
            <div className="frame frame--tall">
              {/* la montagna sta in basso nella foto: il ritaglio parte da lì */}
              <Photo photo="panorami/monte-bianco" alt={t('where.imgMontBlanc')} focus="center 85%" sizes="(max-width: 860px) 50vw, 300px" />
            </div>
          </div>
        </div>
        <div>
          <p className="eyebrow">{t('where.eyebrow')}</p>
          <SplitHeading text={t('where.title')} />
          <p className="lede">{t('where.p1')}</p>
          <ul className="places">
            {PLACES.map(([name, key]) => (
              <li key={name}>
                <i className="rule" aria-hidden="true" />
                <b>{name}</b>
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="strip">
        <div className="strip-track">
          {STRIP.map((p) => (
            <figure key={p.photo}>
              <Photo photo={p.photo} alt={t(p.alt as 'where.imgForest')} sizes="(max-width: 780px) 210px, 36vw" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
