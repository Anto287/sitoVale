import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EASE_OUT, gsap, revealImages, revealOnScroll, isTouch, useGSAP, withMotion } from '../lib/gsap'
import { RESORTS, type PlaceId } from '../data/places'
import type { PhotoKey } from '../lib/photos'
import { Photo } from './Photo'
import { SplitHeading } from './SplitHeading'
import { TarentaiseMap } from './TarentaiseMap'

type StripAlt = 'where.imgClouds' | 'where.imgMontBlanc' | 'where.imgForest' | 'where.imgGondola' | 'where.imgChairlift' | 'where.imgDawn' | 'where.imgLarches' | 'where.imgSunset'

const STRIP: { photo: PhotoKey; alt: StripAlt; focus?: string }[] = [
  { photo: 'panorami/mare-di-nuvole', alt: 'where.imgClouds' },
  { photo: 'panorami/bosco-innevato', alt: 'where.imgForest' },
  { photo: 'panorami/cabinovia-monte-bianco', alt: 'where.imgGondola' },
  { photo: 'panorami/monte-bianco', alt: 'where.imgMontBlanc', focus: 'center 85%' },
  { photo: 'panorami/seggiovia', alt: 'where.imgChairlift' },
  { photo: 'panorami/alba', alt: 'where.imgDawn' },
  { photo: 'panorami/larici', alt: 'where.imgLarches' },
  { photo: 'panorami/tramonto-pista', alt: 'where.imgSunset' },
]

export function Where() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState<PlaceId | null>(null)

  useGSAP(
    () =>
      withMotion(() => {
        revealOnScroll('.eyebrow')

        gsap
          .timeline({ scrollTrigger: { trigger: '.places', start: 'top 85%', once: true } })
          .from('.places .rule', { scaleX: 0, transformOrigin: '0% 50%', duration: 1.2, ease: 'power4.inOut', stagger: 0.15 })
          .from('.places li > :not(.rule)', { y: 18, autoAlpha: 0, duration: 0.9, ease: EASE_OUT, stagger: 0.08 }, 0.3)
        revealImages('.strip figure', { stagger: 0.08, start: 'top 95%' })
      }),
    { scope: ref },
  )

  useGSAP(
    () =>
      withMotion(() => {
        const strip = ref.current!.querySelector<HTMLElement>('.strip')!
        const track = strip.querySelector<HTMLElement>('.strip-track')!
        const shift = () => Math.min(0, strip.clientWidth - track.scrollWidth)
        strip.classList.add('is-driven')

        if (isTouch() && CSS.supports('animation-timeline: view()')) {
          const sync = () => strip.style.setProperty('--strip-shift', `${shift()}px`)
          sync()
          const ro = new ResizeObserver(sync)
          ro.observe(strip)
          ro.observe(track)
          strip.classList.add('is-css-driven')
          return () => {
            ro.disconnect()
            strip.classList.remove('is-driven', 'is-css-driven')
          }
        }

        gsap.fromTo(
          track,
          { x: () => shift() * 0.08 },
          {
            x: shift,
            ease: 'none',
            scrollTrigger: { trigger: strip, start: 'top bottom', end: 'bottom top', scrub: isTouch() ? true : 0.25, invalidateOnRefresh: true },
          },
        )
        return () => strip.classList.remove('is-driven')
      }),
    { scope: ref },
  )

  return (
    <section ref={ref} className="section where" id="dove">
      <div className="wrap split split--rev">
        <div className="split-media">
          <TarentaiseMap active={active} onHover={setActive} />
        </div>
        <div>
          <p className="eyebrow">{t('where.eyebrow')}</p>
          <SplitHeading text={t('where.title')} />
          <p className="lede">{t('where.p1')}</p>
          <ul className="places">
            {RESORTS.map(({ id, name }) => (
              <li key={id} className={active === id ? 'is-active' : undefined} onPointerEnter={() => setActive(id)} onPointerLeave={() => setActive(null)}>
                <i className="rule" aria-hidden="true" />
                <b>{name}</b>
                <span>{t(`where.${id}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="strip">
        <div className="strip-track">
          {STRIP.map((p) => (
            <figure key={p.photo}>
              <Photo photo={p.photo} alt={t(p.alt)} focus={p.focus} sizes="(max-width: 780px) 210px, 36vw" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
