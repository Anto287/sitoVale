import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { REVIEWS, type Review } from '../data/reviews'
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
  // voto medio, mostrato una volta sola in testa alla sezione (nelle card sarebbe sempre uguale)
  const average = REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length

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
            <div className="reviews-summary">
              <Stars rating={average} />
              {/* il voto lo legge già l'etichetta delle stelle: qui solo per l'occhio */}
              <b aria-hidden="true">{new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(average)}</b>
              <span className="sr-only"> · </span>
              <span>{t('reviews.summary', { count: REVIEWS.length })}</span>
            </div>
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
            source={r.source}
            meta={r.date ? formatDate(r.date) : ''}
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

type CardProps = { text: string; textLang?: string; author: string; source: Review['source']; meta: string; translated: boolean }

const STAR = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z'

/** Voto in stelle: le stelle piene coprono la parte giusta, anche con i decimali. */
function Stars({ rating }: { rating: number }) {
  const { t, i18n } = useTranslation()
  const value = new Intl.NumberFormat(i18n.resolvedLanguage, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(rating)
  const row = (
    <svg viewBox="0 0 120 24" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={STAR} transform={`translate(${i * 24} 0)`} />
      ))}
    </svg>
  )
  return (
    <span className="stars" role="img" aria-label={t('reviews.rating', { rating: value })}>
      <span className="stars-base">{row}</span>
      <span className="stars-fill" style={{ width: `${(rating / 5) * 100}%` }}>
        {row}
      </span>
    </span>
  )
}

/** Fonte della recensione: la "G" di Google, una sigla per Maison Sport. */
function SourceMark({ source }: { source: Review['source'] }) {
  if (source === 'Google')
    return (
      <svg className="source-mark" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8.1z" />
        <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8z" />
        <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
      </svg>
    )
  return (
    <span className="source-mark source-mark--ms" aria-hidden="true">
      MS
    </span>
  )
}

/** Card con il testo tagliato a 9 righe; "Leggi tutto" compare solo se serve davvero. */
function ReviewCard({ text, textLang, author, source, meta, translated }: CardProps) {
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
        <span className="review-meta">
          <SourceMark source={source} />
          <span>
            {[source, meta].filter(Boolean).join(' · ')}
            {translated && <em> · {t('reviews.translated')}</em>}
          </span>
        </span>
      </footer>
    </blockquote>
  )
}
