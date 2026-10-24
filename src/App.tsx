import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { About } from './components/About'
import { Contact } from './components/Contact'
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
import { ScrollTrigger, scrollToHash, startSmoothScroll, useGSAP, withRichMotion } from './lib/gsap'

export default function App() {
  const { t, i18n } = useTranslation()

  useGSAP(() => withRichMotion(startSmoothScroll))

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

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [i18n.resolvedLanguage])
  useEffect(() => {
    void document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      <a className="skip-link" href="#chi">
        {t('a11y.skip')}
      </a>
      <Nav />
      <Hero />
      <main>
        <SkiTrail />
        <About />
        <Lessons />
        <Where />
        <Reviews />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <MobileCta />
    </>
  )
}
