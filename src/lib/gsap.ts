import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, SplitText)

gsap.defaults({ ease: 'power3.out', duration: 1 })

// Su mobile la barra degli indirizzi che compare/scompare cambia l'altezza della finestra:
// senza questo ScrollTrigger ricalcolerebbe tutto a ogni scroll (scatti visibili).
if (typeof window !== 'undefined') ScrollTrigger.config({ ignoreMobileResize: true })

/** Curva "morbida" usata per quasi tutte le entrate. */
export const EASE_OUT = 'expo.out'
export const EASE_IN_OUT = 'power3.inOut'

export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Esegue `setup` solo se l'utente non ha chiesto movimento ridotto.
 * Da chiamare dentro useGSAP: tutto ciò che viene creato si annulla da solo
 * (e si ricrea se la preferenza cambia a pagina aperta).
 */
export function withMotion(setup: () => void | (() => void)) {
  const mm = gsap.matchMedia()
  mm.add(MOTION_OK, setup)
  return () => mm.revert()
}

/**
 * Entrata standard al primo ingresso nel viewport: sale e appare, a gruppi,
 * con stagger tra gli elementi che entrano insieme.
 */
export function revealOnScroll(targets: gsap.DOMTarget, vars: { y?: number; stagger?: number; start?: string } = {}) {
  const els = gsap.utils.toArray<HTMLElement>(targets)
  if (!els.length) return
  const { y = 44, stagger = 0.1, start = 'top 90%' } = vars
  gsap.set(els, { autoAlpha: 0, y })
  ScrollTrigger.batch(els, {
    start,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 1.1,
        ease: EASE_OUT,
        stagger,
        overwrite: true,
        // restituisce il controllo al CSS (hover sulle card ecc.)
        clearProps: 'transform',
      }),
  })
}

/**
 * Foto che si "scopre" dal basso mentre l'immagine interna rientra dallo zoom.
 */
export function revealImages(frames: gsap.DOMTarget, vars: { stagger?: number; start?: string } = {}) {
  const els = gsap.utils.toArray<HTMLElement>(frames)
  if (!els.length) return
  const { stagger = 0.12, start = 'top 88%' } = vars
  els.forEach((frame) => {
    gsap.set(frame, { clipPath: 'inset(100% 0% 0% 0%)' })
    const img = frame.querySelector('img')
    if (img) gsap.set(img, { scale: 1.3 })
  })
  ScrollTrigger.batch(els, {
    start,
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut', stagger, clearProps: 'clipPath' })
      gsap.to(
        batch.map((f) => f.querySelector('img')),
        { scale: 1, duration: 1.8, ease: EASE_OUT, stagger, clearProps: 'transform' },
      )
    },
  })
}

/** Scroll morbido verso un'ancora interna (#id), rispettando la preferenza di movimento. */
export function scrollToHash(hash: string) {
  const target = hash === '#top' || hash === '#' ? 0 : document.querySelector(hash)
  if (target === null) return false
  gsap.to(window, {
    scrollTo: { y: target, autoKill: true },
    duration: prefersReducedMotion() ? 0 : 1.3,
    ease: EASE_IN_OUT,
    overwrite: true,
  })
  history.replaceState(null, '', hash === '#top' ? location.pathname + location.search : hash)
  // Il focus segue lo scroll: chi usa tastiera o screen reader riparte da lì.
  if (target instanceof HTMLElement) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }
  return true
}

export { gsap, ScrollTrigger, SplitText, useGSAP }
