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
  const toggleRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [stuck, setStuck] = useState(false)
  const openRef = useRef(open)
  useEffect(() => {
    openRef.current = open
  }, [open])

  useGSAP(
    () => {
      const sync = (self: ScrollTrigger) => setStuck(self.scroll() > 40)
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: sync, onRefresh: sync })

      return withMotion(() => {
        const nav = ref.current!
        const hide = gsap.quickTo(nav, 'yPercent', { duration: 0.5, ease: 'power3.out' })
        ScrollTrigger.create({
          start: () => window.innerHeight * 0.6,
          end: 'max',
          onUpdate: (self) => hide(self.direction === 1 && !openRef.current && !nav.contains(document.activeElement) ? -110 : 0),
          onLeaveBack: () => hide(0),
        })
      })
    },
    { scope: ref },
  )

  useGSAP(
    () => {
      if (!open) return
      withMotion(() => {
        gsap
          .timeline({
            defaults: { ease: EASE_OUT },
            onComplete: () => {
              if (document.activeElement === toggleRef.current) {
                menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true })
              }
            },
          })
          .from(menuRef.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'power3.inOut', clearProps: 'clipPath' })
          .from('.menu-links a > *', { yPercent: 110, duration: 0.9, stagger: 0.06 }, 0.3)
          .from('.menu-foot > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.55)
      })
    },
    { scope: menuRef, dependencies: [open], revertOnUpdate: true },
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1040px)')
    const onChange = () => !mq.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const background = [...document.querySelectorAll<HTMLElement>('.hero, main, .footer, .mobile-cta, .skip-link')]
    const previousInert = background.map((element) => element.inert)
    background.forEach((element) => { element.inert = true })
    const focusFrame = requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true })
    })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        toggleRef.current?.focus({ preventScroll: true })
      }
      if (e.key === 'Tab') {
        const items = [
          toggleRef.current!,
          ...menuRef.current!.querySelectorAll<HTMLElement>('a[href], button'),
        ].filter((element) => element.getClientRects().length > 0)
        const index = items.indexOf(document.activeElement as HTMLElement)
        e.preventDefault()
        items[(index + (e.shiftKey ? -1 : 1) + items.length) % items.length]?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      background.forEach((element, index) => { element.inert = previousInert[index] })
      document.removeEventListener('keydown', onKey)
    }
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
          ref={toggleRef}
          className="burger"
          type="button"
          aria-label={t(open ? 'a11y.close' : 'a11y.menu')}
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

      <div ref={menuRef} className={`menu${open ? ' is-open' : ''}`} id="navmenu" role="navigation" aria-label={t('a11y.menu')} aria-hidden={!open} inert={!open} data-lenis-prevent>
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
