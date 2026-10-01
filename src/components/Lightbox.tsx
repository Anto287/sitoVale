import { useCallback, useEffect, useRef, type Dispatch, type PointerEvent, type RefObject, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { GALLERY, type GalleryView } from '../data/gallery'
import { EASE_IN_OUT, gsap, prefersReducedMotion, useGSAP } from '../lib/gsap'
import { photoSrcSet } from '../lib/photos'
import { Photo } from './Photo'

/*
 * Foto a tutto schermo della galleria. File a parte, scaricato solo quando la galleria
 * si avvicina (o al primo tocco su una foto): chi non arriva fin lì non lo paga.
 */

const N = GALLERY.length
const wrap = (i: number) => (i + N) % N

/** Trasformazione che porta il riquadro `to` a coincidere con `from`. */
function delta(from: DOMRect, to: DOMRect) {
  return {
    x: from.left - to.left,
    y: from.top - to.top,
    scaleX: from.width / to.width,
    scaleY: from.height / to.height,
  }
}

/** Scarica in anticipo le foto accanto a quella aperta: sfogliando non si aspetta. */
function preload(i: number) {
  const img = new Image()
  img.sizes = '100vw'
  img.srcset = photoSrcSet(GALLERY[wrap(i)].photo)
}

type Props = {
  view: GalleryView
  setView: Dispatch<SetStateAction<GalleryView>>
  thumbs: RefObject<(HTMLButtonElement | null)[]>
}

export default function Lightbox({ view, setView, thumbs }: Props) {
  const { t } = useTranslation()
  const lbRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const swipe = useRef<{ x: number; y: number } | null>(null)

  const go = useCallback((dir: 1 | -1) => setView((v) => (v ? { index: wrap(v.index + dir), dir } : v)), [setView])

  // Apertura: la foto parte esattamente dalla miniatura e si espande (FLIP).
  // Sfogliando: la nuova foto entra dal lato giusto.
  useGSAP(
    (_ctx, contextSafe) => {
      if (!view) return
      const lb = lbRef.current!
      const img = lb.querySelector<HTMLImageElement>('.lb-img')!
      const thumb = thumbs.current[view.index]?.querySelector('img')
      preload(view.index + 1)
      preload(view.index - 1)

      gsap.set(lb, { autoAlpha: 1 })
      if (view.dir === 0) lb.querySelector<HTMLButtonElement>('.lb-close')?.focus({ preventScroll: true })
      if (prefersReducedMotion() || !thumb) return

      if (view.dir !== 0) {
        gsap.from(img, { xPercent: 10 * view.dir, autoAlpha: 0, duration: 0.55, ease: 'power3.out' })
        return
      }

      // Niente flash della foto a tutto schermo mentre si decodifica.
      gsap.set(lb, { backgroundColor: 'rgba(20,20,24,0)' })
      gsap.set(img, { autoAlpha: 0 })
      const play = contextSafe!(() => {
        gsap.set(img, { autoAlpha: 1 })
        gsap
          .timeline({ defaults: { ease: EASE_IN_OUT } })
          .to(lb, { backgroundColor: 'rgba(20,20,24,.94)', duration: 0.6 }, 0)
          .from(img, { ...delta(thumb.getBoundingClientRect(), img.getBoundingClientRect()), transformOrigin: '0 0', duration: 0.8 }, 0)
          .from('.lb-ui', { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, 0.45)
      })
      img.decode().then(play, play)
    },
    { scope: lbRef, dependencies: [view?.index, view?.dir], revertOnUpdate: true },
  )

  const { contextSafe } = useGSAP({ scope: lbRef })

  // Chiusura: stesso percorso al contrario, poi si restituisce il focus.
  // oxlint-disable-next-line react/refs -- contextSafe restituisce un handler: i ref si leggono solo al click
  const close = contextSafe(() => {
    if (!view || closing.current) return
    const lb = lbRef.current!
    const img = lb.querySelector('.lb-img')!
    const btn = thumbs.current[view.index]
    const thumb = btn?.querySelector('img')
    const ui = lb.querySelectorAll('.lb-ui')
    const done = () => {
      closing.current = false
      gsap.set(lb, { clearProps: 'opacity,visibility,backgroundColor' })
      gsap.set(ui, { clearProps: 'opacity,visibility,transform' })
      setView(null)
      btn?.focus({ preventScroll: true })
    }
    if (prefersReducedMotion() || !thumb) return done()

    closing.current = true
    const target = thumb.getBoundingClientRect()
    // Dopo aver sfogliato la miniatura può essere fuori schermo: meglio sfumare.
    const onScreen = target.bottom > 0 && target.top < window.innerHeight
    gsap
      .timeline({ defaults: { ease: EASE_IN_OUT }, onComplete: done })
      .to(ui, { autoAlpha: 0, duration: 0.25 }, 0)
      .to(
        img,
        onScreen
          ? { ...delta(target, img.getBoundingClientRect()), transformOrigin: '0 0', duration: 0.7 }
          : { autoAlpha: 0, scale: 0.96, duration: 0.45 },
        0,
      )
      .to(lb, { backgroundColor: 'rgba(20,20,24,0)', duration: 0.6 }, 0.1)
  })

  useEffect(() => {
    if (!view) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
      // il focus resta dentro il dialog
      if (e.key === 'Tab') {
        const items = [...lbRef.current!.querySelectorAll<HTMLButtonElement>('button')]
        const i = items.indexOf(document.activeElement as HTMLButtonElement)
        e.preventDefault()
        items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length]?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [view, close, go])

  // Swipe orizzontale su touch: avanti/indietro. Uno swipe verticale non fa nulla.
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') swipe.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) go(dx < 0 ? 1 : -1)
  }

  const current = view ? GALLERY[view.index] : null

  return (
    <div
      ref={lbRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={t('a11y.photo')}
      aria-hidden={!view}
      onClick={(e) => e.target === e.currentTarget && close()}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <button type="button" className="lb-close lb-ui" aria-label={t('a11y.close')} onClick={close}>
        ×
      </button>
      <button type="button" className="lb-nav lb-prev lb-ui" aria-label={t('a11y.prevPhoto')} onClick={() => go(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M19 12H6m5 6-6-6 6-6" />
        </svg>
      </button>
      <button type="button" className="lb-nav lb-next lb-ui" aria-label={t('a11y.nextPhoto')} onClick={() => go(1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M5 12h13m-5-6 6 6-6 6" />
        </svg>
      </button>
      {current && view && (
        <>
          <Photo key={current.photo} className="lb-img" photo={current.photo} alt={t(current.alt)} sizes="100vw" loading="eager" />
          <p className="lb-count lb-ui" aria-live="polite">
            {view.index + 1} / {N}
          </p>
        </>
      )}
    </div>
  )
}
