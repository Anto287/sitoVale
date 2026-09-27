import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { chooseLanguage, LANGUAGES, pathFor } from '../i18n'
import { EASE_OUT, gsap, ScrollTrigger, useGSAP, withMotion } from '../lib/gsap'

const LINKS = [
  ['#chi', 'nav.about'],
  ['#lezioni', 'nav.lessons'],
  ['#tariffe', 'nav.rates'],
  ['#dove', 'nav.where'],
  ['#galleria', 'nav.gallery'],
  ['#contatti', 'nav.contact'],
] as const

export function Nav() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [stuck, setStuck] = useState(false)
  const openRef = useRef(open)
  useEffect(() => {
    openRef.current = open
  }, [open])

  useGSAP(
    () => {
      // Sfondo pieno dopo i primi 40px di scroll. Si guarda la posizione e non
      // isActive: con end 'max' in fondo alla pagina il trigger risulterebbe "uscito".
      const sync = (self: ScrollTrigger) => setStuck(self.scroll() > 40)
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: sync, onRefresh: sync })

      // Scendendo la barra si nasconde, risalendo torna.
      return withMotion(() => {
        const nav = ref.current!
        const hide = gsap.quickTo(nav, 'yPercent', { duration: 0.5, ease: 'power3.out' })
        ScrollTrigger.create({
          start: () => window.innerHeight * 0.6,
          end: 'max',
          onUpdate: (self) => hide(self.direction === 1 && !openRef.current ? -110 : 0),
          onLeaveBack: () => hide(0),
        })
      })
    },
    { scope: ref },
  )

  // Menu mobile: le voci entrano in cascata.
  useGSAP(
    () => {
      if (!open || !window.matchMedia('(max-width: 960px)').matches) return
      withMotion(() => {
        gsap.from('.nav-links > *', { y: 36, autoAlpha: 0, duration: 0.8, ease: EASE_OUT, stagger: 0.06, delay: 0.1 })
      })
    },
    { scope: ref, dependencies: [open], revertOnUpdate: true },
  )

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <nav ref={ref} className={`nav${stuck ? ' is-stuck' : ''}${open ? ' is-open' : ''}`}>
      <a className="brand" href="#top" data-intro="nav">
        <span>Valentina&nbsp;Bernardi</span>
        <small>{t('nav.role')}</small>
      </a>
      <div className="nav-links" id="navlinks">
        {LINKS.map(([href, key]) => (
          <a key={href} href={href} onClick={() => setOpen(false)} data-intro="nav">
            {t(key)}
          </a>
        ))}
        <LangSwitch className="lang--menu" />
      </div>
      <LangSwitch data-intro="nav" />
      <a className="btn btn--accent nav-cta" href="#contatti" data-intro="nav" data-magnetic>
        {t('nav.book')}
      </a>
      <button
        className="burger"
        type="button"
        aria-label={t('a11y.menu')}
        aria-expanded={open}
        aria-controls="navlinks"
        onClick={() => setOpen((o) => !o)}
        data-intro="nav"
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  )
}

function LangSwitch({ className, ...rest }: { className?: string; 'data-intro'?: string }) {
  const { t, i18n } = useTranslation()
  return (
    <div className={className ? `lang ${className}` : 'lang'} role="group" aria-label={t('a11y.languageGroup')} {...rest}>
      {/* link veri (/it/, /fr/): li seguono anche i motori di ricerca; al clic si cambia senza ricaricare */}
      {LANGUAGES.map((code) => (
        <a
          key={code}
          href={pathFor(code)}
          hrefLang={code}
          lang={code}
          aria-current={i18n.resolvedLanguage === code ? 'true' : undefined}
          onClick={(e) => {
            e.preventDefault()
            chooseLanguage(code)
          }}
        >
          <span>{code.toUpperCase()}</span>
        </a>
      ))}
    </div>
  )
}
