import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GALLERY, type GalleryView } from '../data/gallery'
import { revealImages, revealOnScroll, useGSAP, withMotion } from '../lib/gsap'
import { Photo } from './Photo'
import { SplitHeading } from './SplitHeading'

// la lightbox è un file a parte: si scarica quando la galleria è vicina (vedi sotto)
const Lightbox = lazy(() => import('./Lightbox'))

export function Gallery() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const [view, setView] = useState<GalleryView>(null)
  const [lightbox, setLightbox] = useState(false)
  const thumbs = useRef<(HTMLButtonElement | null)[]>([])

  useGSAP(
    () =>
      withMotion(() => {
        revealOnScroll('.eyebrow')
        revealImages('.gallery figure', { stagger: 0.1, start: 'top 92%' })
      }),
    { scope: ref },
  )

  // A uno schermo e mezzo dalla galleria si scarica la lightbox: al tocco su una foto è già pronta.
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setLightbox(true)
        io.disconnect()
      },
      { rootMargin: '150% 0px' },
    )
    io.observe(ref.current!)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={ref} className="section" id="galleria">
      <div className="wrap">
        <p className="eyebrow">{t('gallery.eyebrow')}</p>
        <SplitHeading text={t('gallery.title')} style={{ maxWidth: '18ch' }} />
        <div className="gallery">
          {GALLERY.map((p, i) => (
            <figure key={p.photo}>
              <button
                type="button"
                ref={(el) => {
                  thumbs.current[i] = el
                }}
                onClick={() => {
                  setLightbox(true)
                  setView({ index: i, dir: 0 })
                }}
              >
                <Photo photo={p.photo} alt={t(p.alt)} sizes="(max-width: 480px) 90vw, (max-width: 860px) 45vw, 400px" />
              </button>
            </figure>
          ))}
        </div>
      </div>

      {lightbox && (
        <Suspense fallback={null}>
          <Lightbox view={view} setView={setView} thumbs={thumbs} />
        </Suspense>
      )}
    </section>
  )
}
