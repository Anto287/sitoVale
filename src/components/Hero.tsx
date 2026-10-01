import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { EASE_OUT, gsap, SplitText, useGSAP, withMotion } from '../lib/gsap'
import { Photo } from './Photo'
import { Snow } from './Snow'

export function Hero() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () =>
      withMotion(() => {
        const chars = SplitText.create('h1 .ln i', { type: 'chars', charsClass: 'ch' }).chars

        // Ingresso: la foto rientra dallo zoom, il nome sale lettera per lettera,
        // poi testo, bottoni e barra di navigazione (fuori scope: querySelectorAll).
        // La foto è già a schermo prima del JavaScript (pagina pre-generata), leggermente
        // ingrandita e velata dal CSS (html.intro-pending): si parte da lì com'è adesso,
        // senza farla sparire nel nero e ricomparire.
        const img = ref.current!.querySelector<HTMLImageElement>('.hero-media img')!
        const shade = ref.current!.querySelector<HTMLElement>('.hero-shade')!
        const intro = gsap.timeline({ paused: true, defaults: { ease: EASE_OUT } })
        intro
          .fromTo(img, { scale: gsap.getProperty(img, 'scale') }, { scale: 1, duration: 2.8, ease: 'power2.out' }, 0)
          .fromTo(shade, { opacity: gsap.getProperty(shade, 'opacity') }, { opacity: 0, duration: 1.6, ease: 'power1.out' }, 0)
          .from(chars, { yPercent: 118, duration: 1.3, stagger: 0.035 }, 0.25)
          .from('[data-intro="hero"]', { y: 26, autoAlpha: 0, duration: 1.1, stagger: 0.12 }, 0.75)
          .from(document.querySelectorAll('[data-intro="nav"]'), { y: -18, autoAlpha: 0, duration: 0.9, stagger: 0.05, clearProps: 'transform' }, 0.9)

        // Da qui gli elementi sono nascosti dagli stati iniziali di GSAP: si toglie il "nascondi"
        // messo da index.html per non vederli apparire e sparire mentre il JavaScript arrivava.
        document.documentElement.classList.remove('intro-pending')

        // L'ingresso parte quando la foto è pronta: altrimenti zoom e dissolvenza girano
        // sul vuoto e la foto compare di colpo a metà. Dopo 1,5 s si parte comunque.
        const start = () => intro.play()
        const fallback = window.setTimeout(start, 1500)
        img.decode().then(start, start).finally(() => window.clearTimeout(fallback))

        // Uscita allo scroll: parallasse sulla foto, il testo si allontana e sfuma.
        const out = { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true }
        gsap.to('.hero-media', { yPercent: 16, ease: 'none', scrollTrigger: out })
        gsap.to('.hero-inner', { yPercent: -18, autoAlpha: 0, ease: 'none', scrollTrigger: { ...out, end: 'bottom 25%' } })

        return () => window.clearTimeout(fallback)
      }),
    { scope: ref },
  )

  return (
    <header ref={ref} className="hero" id="top">
      <div className="hero-media">
        <Photo photo="lezioni/mare-di-nuvole" alt={t('hero.imgAlt')} sizes="100vw" priority focus="center 45%" />
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <Snow />
      <div className="hero-inner">
        {/* "Maestra di sci" fa parte del titolo: è la prima cosa che legge chi arriva da Google */}
        <h1>
          <span className="eyebrow hero-kicker" data-intro="hero">
            {t('hero.eyebrow')}
            <span className="sr-only"> — </span>
          </span>
          <span className="ln">
            <i>Valentina</i>
          </span>
          {/* le righe sono blocchi: senza questo spazio screen reader e Google leggerebbero "ValentinaBernardi" */}
          {' '}
          <span className="ln">
            <i>
              <em>Bernardi</em>
            </i>
          </span>
        </h1>
        <p className="hero-lede" data-intro="hero">
          {t('hero.lede')}
        </p>
        <div className="hero-actions" data-intro="hero">
          <a className="btn btn--accent" href="#contatti" data-magnetic>
            <span>{t('hero.ctaBook')}</span>
          </a>
          <a className="btn btn--outline-light" href="#lezioni" data-magnetic>
            <span>{t('hero.ctaLessons')}</span>
          </a>
        </div>
      </div>
      <a className="hero-scroll" href="#chi" data-intro="hero">
        <span>{t('hero.scroll')}</span>
        <i aria-hidden="true" />
      </a>
    </header>
  )
}
