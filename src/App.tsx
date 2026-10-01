import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { About } from './components/About'
import { Booking } from './components/Booking'
import { Contact } from './components/Contact'
import { Facts } from './components/Facts'
import { Footer } from './components/Footer'
import { Gallery } from './components/Gallery'
import { Hero } from './components/Hero'
import { Lessons } from './components/Lessons'
import { MobileCta } from './components/MobileCta'
import { Nav } from './components/Nav'
import { Reviews } from './components/Reviews'
import { SkiTrail } from './components/SkiTrail'
import { Where } from './components/Where'
import { track } from './lib/analytics'
import { gsap, pace, ScrollTrigger, scrollToHash, startSmoothScroll, useGSAP, withMotion } from './lib/gsap'

export default function App() {
  const { t, i18n } = useTranslation()

  // Scroll morbido con rotellina/trackpad (spento con "riduci movimento": resta quello nativo).
  useGSAP(() => withMotion(startSmoothScroll))

  // Tutti i link #ancora scorrono con GSAP invece del salto secco.
  // Statistiche: si contano i tocchi su WhatsApp ed email (solo se GoatCounter è attivo).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest<HTMLAnchorElement>('a[href]')
      if (link?.href.includes('wa.me/')) track('whatsapp')
      else if (link?.href.startsWith('mailto:')) track('email')
      else if (link?.href.endsWith('.pdf')) track('condizioni-pdf')
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      if (a && scrollToHash(a.getAttribute('href')!)) e.preventDefault()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Testi di lunghezza diversa e font caricati in ritardo spostano le sezioni:
  // ricalcolo le posizioni dei trigger.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [i18n.resolvedLanguage])
  useEffect(() => {
    void document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  // La lineetta fucsia degli eyebrow si disegna quando la sezione entra.
  useGSAP(() =>
    withMotion(() => {
      const eyebrows = gsap.utils.toArray<HTMLElement>('.eyebrow')
      gsap.set(eyebrows, { '--line': 0 })
      ScrollTrigger.batch(eyebrows, {
        start: 'top 92%',
        once: true,
        onEnter: (batch, triggers) => {
          const k = pace(triggers)
          gsap.to(batch, { '--line': 1, duration: 1.2 * k, ease: 'expo.out', stagger: 0.1 * k, delay: 0.15 * k })
        },
      })
    }),
  )

  // Bottoni "magnetici": seguono leggermente il puntatore (solo mouse).
  useGSAP(() =>
    withMotion(() => {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
      const cleanups = gsap.utils.toArray<HTMLElement>('[data-magnetic]').map((el) => {
        const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
        const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          x((e.clientX - (r.left + r.width / 2)) * 0.25)
          y((e.clientY - (r.top + r.height / 2)) * 0.35)
        }
        const leave = () => {
          x(0)
          y(0)
        }
        el.addEventListener('pointermove', move)
        el.addEventListener('pointerleave', leave)
        return () => {
          el.removeEventListener('pointermove', move)
          el.removeEventListener('pointerleave', leave)
        }
      })
      return () => cleanups.forEach((c) => c())
    }),
  )

  return (
    <>
      <a className="skip-link" href="#chi">
        {t('a11y.skip')}
      </a>
      <Nav />
      <Hero />
      {/* ordine pensato per alternare fasce colorate e sezioni di foto */}
      <main>
        <SkiTrail />
        <Facts />
        <About />
        <Lessons />
        <Where />
        <Reviews />
        <Gallery />
        <Booking />
        <Contact />
      </main>
      <Footer />
      <MobileCta />
    </>
  )
}
