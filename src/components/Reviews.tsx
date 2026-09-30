import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { REVIEWS } from '../data/reviews'
import type { Language } from '../i18n'
import { EASE_IN_OUT, gsap, prefersReducedMotion, revealOnScroll, useGSAP, withMotion } from '../lib/gsap'
import { SplitHeading } from './SplitHeading'

export function Reviews() {
  const { t, i18n } = useTranslation()
  const lang = (i18n.resolvedLanguage ?? 'en') as Language
  const ref = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  const month = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' })
  const formatDate = (ym: string) => {
    const [y, m] = ym.split('-').map(Number)
    return month.format(new Date(y, m - 1, 1))
  }

  useGSAP(
    () =>
      withMotion(() => {
        revealOnScroll('.eyebrow, .reviews-summary, .reviews-nav')
        revealOnScroll('.review', { y: 60, stagger: 0.1, start: 'top 95%' })
      }),
    { scope: ref },
  )

  // Barra di avanzamento e stato dei pulsanti seguono lo scroll orizzontale.
  useEffect(() => {
    const track = trackRef.current!
    const setBar = gsap.quickSetter(barRef.current, 'scaleX')
    const onScroll = () => {
      const max = track.scrollWidth - track.clientWidth
      const p = max > 0 ? track.scrollLeft / max : 1
      setBar(Math.max(0.04, p))
      setEdge({ start: track.scrollLeft < 4, end: track.scrollLeft > max - 4 })
    }
    onScroll()
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const step = (dir: 1 | -1) => {
    const track = trackRef.current!
    const card = track.querySelector<HTMLElement>('.review')
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0
    const by = card ? card.offsetWidth + gap : track.clientWidth
    const max = track.scrollWidth - track.clientWidth
    const x = Math.max(0, Math.min(max, track.scrollLeft + dir * by))
    // scroll-snap disattivato durante il tween, altrimenti il browser "tira" la card a metà corsa
    track.style.scrollSnapType = 'none'
    gsap.to(track, {
      scrollTo: { x },
      duration: prefersReducedMotion() ? 0 : 0.8,
      ease: EASE_IN_OUT,
      overwrite: true,
      onComplete: () => {
        track.style.scrollSnapType = ''
      },
    })
  }

  return (
    <section ref={ref} className="section section--alt reviews" id="recensioni">
      <div className="wrap">
        <div className="reviews-head">
          <div>
            <p className="eyebrow">{t('reviews.eyebrow')}</p>
            <SplitHeading text={t('reviews.title')} style={{ maxWidth: '16ch' }} />
            <p className="reviews-summary">{t('reviews.summary', { count: REVIEWS.length })}</p>
          </div>
          <div className="reviews-nav">
            <button type="button" onClick={() => step(-1)} disabled={edge.start} aria-label={t('a11y.prevReview')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M19 12H6m5 6-6-6 6-6" />
              </svg>
            </button>
            <button type="button" onClick={() => step(1)} disabled={edge.end} aria-label={t('a11y.nextReview')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M5 12h13m-5-6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className="reviews-track"
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-label={t('reviews.eyebrow')}
        // gesto orizzontale (trackpad o dito): scorre le card; quello verticale scorre la pagina
        data-lenis-prevent-horizontal
      >
        {REVIEWS.map((r) => (
          <ReviewCard
            key={r.id}
            // testo originale se c'è (uguale in ogni lingua), altrimenti la traduzione
            text={r.original?.text ?? t(`reviews.items.${r.id as 'lynne'}`)}
            textLang={r.original ? (r.original.lang === 'other' ? undefined : r.original.lang) : lang}
            author={r.author}
            meta={[r.source, r.date && formatDate(r.date)].filter(Boolean).join(' · ')}
            translated={!r.original}
          />
        ))}
      </div>

      <div className="wrap">
        <div className="reviews-progress" aria-hidden="true">
          <span ref={barRef} />
        </div>
      </div>
    </section>
  )
}

type CardProps = { text: string; textLang?: string; author: string; meta: string; translated: boolean }

/** Card con il testo tagliato a 9 righe; "Leggi tutto" compare solo se serve davvero. */
function ReviewCard({ text, textLang, author, meta, translated }: CardProps) {
  const { t } = useTranslation()
  const pRef = useRef<HTMLParagraphElement>(null)
  const [open, setOpen] = useState(false)
  const [clamped, setClamped] = useState(false)

  useLayoutEffect(() => {
    const p = pRef.current!
    const measure = () => {
      if (!p.classList.contains('is-clamped')) return
      setClamped(p.scrollHeight > p.clientHeight + 2)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(p)
    return () => ro.disconnect()
  }, [text])

  const toggle = () => {
    const p = pRef.current!
    const from = p.offsetHeight
    setOpen((o) => !o)
    // altezza animata con GSAP: dal valore attuale a quello nuovo, poi si libera
    requestAnimationFrame(() => {
      gsap.fromTo(p, { height: from }, { height: p.scrollHeight > from ? p.scrollHeight : 'auto', duration: prefersReducedMotion() ? 0 : 0.5, ease: EASE_IN_OUT, clearProps: 'height' })
    })
  }

  return (
    <blockquote className="review">
      <span className="mark" aria-hidden="true">
        “
      </span>
      {/* lang: gli screen reader leggono la recensione con la pronuncia della sua lingua */}
      <p ref={pRef} className={open ? '' : 'is-clamped'} lang={textLang}>
        {text}
      </p>
      {clamped || open ? (
        <button type="button" className="review-more" aria-expanded={open} onClick={toggle}>
          {open ? t('reviews.readLess') : t('reviews.readMore')}
        </button>
      ) : (
        // stesso spazio del pulsante, così tutte le card chiuse hanno la stessa altezza
        <span className="review-more is-spacer" aria-hidden="true">
          {t('reviews.readMore')}
        </span>
      )}
      <footer>
        <cite>{author}</cite>
        <span>
          {meta}
          {translated && <em> · {t('reviews.translated')}</em>}
        </span>
      </footer>
    </blockquote>
  )
}
