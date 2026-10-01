import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, SplitText, DrawSVGPlugin)

gsap.defaults({ ease: 'power3.out', duration: 1 })

// Su mobile la barra degli indirizzi che compare/scompare cambia l'altezza della finestra:
// senza questo ScrollTrigger ricalcolerebbe tutto a ogni scroll (scatti visibili).
if (typeof window !== 'undefined') ScrollTrigger.config({ ignoreMobileResize: true })

/**
 * Scroll morbido (Lenis) per rotellina, trackpad e dito.
 * Sul telefono (syncTouch) il dito muove la pagina 1:1, ma lo slancio dopo il rilascio lo calcola
 * Lenis invece del telefono: più corto e più dolce, così un colpo secco non "vola" oltre intere
 * sezioni lasciando a metà le loro entrate.
 * Lenis muove lo scroll reale della pagina, quindi ScrollTrigger e le ancore funzionano come prima:
 * gira sullo stesso ticker di GSAP, così scroll e animazioni si aggiornano nello stesso frame.
 */
let lenis: Lenis | null = null

export function startSmoothScroll() {
  const instance = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.9,
    syncTouch: true,
    // slancio dopo il rilascio: distanza ≈ velocità^1.45 (il telefono da solo è molto più lungo)
    touchInertiaExponent: 1.45,
    syncTouchLerp: 0.07,
    // pannelli che scorrono da soli (note legali, foto aperte): lo scroll resta il loro
    prevent: (node) => node.nodeName === 'DIALOG' || node.getAttribute('role') === 'dialog',
    // menu o foto aperti bloccano la pagina (body overflow hidden): Lenis non deve muoverla
    virtualScroll: () => document.body.style.overflow !== 'hidden',
  })
  instance.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  lenis = instance
  return () => {
    gsap.ticker.remove(tick)
    gsap.ticker.lagSmoothing(500, 33)
    instance.destroy()
    lenis = null
  }
}

/**
 * Se una sezione entra mentre si scorre molto veloce (flick sul telefono, barra di scorrimento
 * trascinata) l'entrata si accorcia: arriva a posto prima che la sezione sia già passata.
 * Restituisce un fattore tra 0.4 (velocissimo) e 1 (scroll normale).
 */
export function pace(triggers: ScrollTrigger[]) {
  const v = Math.abs(triggers[0]?.getVelocity() ?? 0)
  return gsap.utils.clamp(0.4, 1, 2200 / Math.max(v, 1))
}

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
  // transition spenta finché GSAP anima: se l'elemento ha una transizione CSS su transform
  // (hover delle card) il browser la rilancerebbe a ogni fotogramma e l'entrata andrebbe a scatti
  gsap.set(els, { autoAlpha: 0, y, transition: 'none' })
  ScrollTrigger.batch(els, {
    start,
    once: true,
    onEnter: (batch, triggers) => {
      const k = pace(triggers)
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 1.1 * k,
        ease: EASE_OUT,
        stagger: stagger * k,
        overwrite: true,
        // restituisce il controllo al CSS (hover sulle card ecc.)
        clearProps: 'transform,transition',
      })
    },
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
    // transition spenta durante lo zoom: vedi revealOnScroll (le foto hanno l'hover in CSS)
    if (img) gsap.set(img, { scale: 1.3, transition: 'none' })
  })
  ScrollTrigger.batch(els, {
    start,
    once: true,
    onEnter: (batch, triggers) => {
      const k = pace(triggers)
      gsap.to(batch, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4 * k, ease: 'power4.inOut', stagger: stagger * k, clearProps: 'clipPath' })
      gsap.to(
        batch.map((f) => f.querySelector('img')),
        { scale: 1, duration: 1.8 * k, ease: EASE_OUT, stagger: stagger * k, clearProps: 'transform,transition' },
      )
    },
  })
}

/** Scroll morbido verso un'ancora interna (#id), rispettando la preferenza di movimento. */
export function scrollToHash(hash: string) {
  const target = hash === '#top' || hash === '#' ? 0 : document.querySelector(hash)
  if (target === null) return false
  if (lenis) lenis.scrollTo(target as HTMLElement | 0, { duration: 1.3, easing: gsap.parseEase(EASE_IN_OUT) })
  else
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
