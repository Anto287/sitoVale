import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CONTACT } from '../config'
import { chooseLanguage, LANGUAGES, pathFor } from '../i18n'
import { EASE_OUT, gsap, ScrollTrigger, useGSAP, withMotion } from '../lib/gsap'

const LINKS = [
  ['#chi', 'nav.about'],
  ['#lezioni', 'nav.lessons'],
  ['#dove', 'nav.where'],
  ['#recensioni', 'nav.reviews'],
  ['#galleria', 'nav.gallery'],
  ['#tariffe', 'nav.rates'],
  ['#contatti', 'nav.contact'],
] as const

export function Nav() {
  const { t } = useTranslation()
  const ref = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
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

  // Menu mobile: il pannello scende dall'alto, le voci salgono in cascata dalla loro riga.
  useGSAP(
    () => {
      if (!open) return
      withMotion(() => {
        gsap
          .timeline({ defaults: { ease: EASE_OUT } })
          .from(menuRef.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'power3.inOut', clearProps: 'clipPath' })
          .from('.menu-links a > *', { yPercent: 110, duration: 0.9, stagger: 0.06 }, 0.3)
          .from('.menu-foot > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.55)
      })
    },
    { scope: menuRef, dependencies: [open], revertOnUpdate: true },
  )

  // Girando il tablet o allargando la finestra oltre i 1040px il menu non esiste più: si chiude.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1040px)')
    const onChange = () => !mq.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <nav ref={ref} className={`nav${stuck ? ' is-stuck' : ''}${open ? ' is-open' : ''}`}>
        <a className="brand" href="#top" data-intro="nav" onClick={() => setOpen(false)}>
          <span>Valentina&nbsp;Bernardi</span>
          <small>{t('nav.role')}</small>
        </a>
        <div className="nav-links">
          {LINKS.map(([href, key]) => (
            <a key={href} href={href} data-intro="nav">
              {t(key)}
            </a>
          ))}
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
          aria-controls="navmenu"
          onClick={() => setOpen((o) => !o)}
          data-intro="nav"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Menu a tutto schermo (sotto i 1040px). Sta fuori dalla <nav>: la barra, quando si scorre,
          ha sfocatura e traslazione, e un elemento fixed al suo interno si misurerebbe su di lei
          (alta 70px) invece che sullo schermo. Chiuso è visibility:hidden, quindi fuori dal tab. */}
      <div ref={menuRef} className={`menu${open ? ' is-open' : ''}`} id="navmenu" data-lenis-prevent>
        <ol className="menu-links">
          {LINKS.map(([href, key], i) => (
            <li key={href}>
              <a href={href} onClick={() => setOpen(false)}>
                <span className="menu-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{t(key)}</span>
              </a>
            </li>
          ))}
        </ol>
        <div className="menu-foot">
          <LangSwitch className="lang--menu" />
          <a className="btn btn--accent" href="#contatti" onClick={() => setOpen(false)}>
            <span>{t('nav.book')}</span>
          </a>
          <p className="menu-contact">
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener">
              WhatsApp {CONTACT.whatsappLabel}
            </a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.emailLabel}</a>
          </p>
        </div>
      </div>
    </>
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
