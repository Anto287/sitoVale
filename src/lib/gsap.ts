import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, SplitText, DrawSVGPlugin)

gsap.defaults({ ease: 'power3.out', duration: 1 })

if (typeof window !== 'undefined') ScrollTrigger.config({ ignoreMobileResize: true })

let lenis: Lenis | null = null

export function startSmoothScroll() {
  const instance = new Lenis({
    lerp: 0.14,
    wheelMultiplier: 0.85,
    syncTouch: true,
    touchInertiaExponent: 1.4,
    syncTouchLerp: 0.1,
    prevent: (node) => node.nodeName === 'DIALOG' || node.getAttribute('role') === 'dialog',
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

export function pace(triggers: ScrollTrigger[]) {
  const v = Math.abs(triggers[0]?.getVelocity() ?? 0)
  return gsap.utils.clamp(0.55, 1, 2200 / Math.max(v, 1))
}

export const EASE_OUT = 'expo.out'
export const EASE_IN_OUT = 'power3.inOut'

export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function withMotion(setup: () => void | (() => void)) {
  const mm = gsap.matchMedia()
  mm.add(MOTION_OK, setup)
  return () => mm.revert()
}

export function revealOnScroll(targets: gsap.DOMTarget, vars: { y?: number; stagger?: number; start?: string } = {}) {
  const els = gsap.utils.toArray<HTMLElement>(targets)
  if (!els.length) return
  const { y = 28, stagger = 0.075, start = 'top 90%' } = vars
  gsap.set(els, { autoAlpha: 0, y, transition: 'none' })
  ScrollTrigger.batch(els, {
    start,
    once: true,
    onEnter: (batch, triggers) => {
      const k = pace(triggers)
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.72 * k,
        ease: EASE_OUT,
        stagger: stagger * k,
        overwrite: true,
        clearProps: 'transform,transition',
      })
    },
  })
}

export function revealImages(frames: gsap.DOMTarget, vars: { stagger?: number; start?: string } = {}) {
  const els = gsap.utils.toArray<HTMLElement>(frames)
  if (!els.length) return
  const { stagger = 0.12, start = 'top 88%' } = vars
  els.forEach((frame) => {
    gsap.set(frame, { clipPath: 'inset(100% 0% 0% 0%)' })
    const img = frame.querySelector('img')
    if (img) gsap.set(img, { scale: 1.12, transition: 'none' })
  })
  ScrollTrigger.batch(els, {
    start,
    once: true,
    onEnter: (batch, triggers) => {
      const k = pace(triggers)
      gsap.to(batch, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85 * k, ease: EASE_OUT, stagger: stagger * k, clearProps: 'clipPath' })
      gsap.to(
        batch.map((f) => f.querySelector('img')),
        { scale: 1, duration: 1.1 * k, ease: EASE_OUT, stagger: stagger * k, clearProps: 'transform,transition' },
      )
    },
  })
}

export function scrollToHash(hash: string) {
  const target = hash === '#top' || hash === '#' ? 0 : document.querySelector(hash)
  if (target === null) return false
  const distance = target instanceof HTMLElement ? Math.abs(target.getBoundingClientRect().top) : window.scrollY
  const duration = gsap.utils.clamp(0.42, 1.2, 0.38 + Math.sqrt(distance) / 60)
  if (lenis) lenis.scrollTo(target as HTMLElement | 0, { duration, easing: gsap.parseEase('power2.inOut') })
  else
    gsap.to(window, {
      scrollTo: { y: target, autoKill: true },
      duration: prefersReducedMotion() ? 0 : duration,
      ease: 'power2.inOut',
      overwrite: true,
    })
  history.replaceState(null, '', hash === '#top' ? location.pathname + location.search : hash)
  if (target instanceof HTMLElement) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }
  return true
}

export { gsap, ScrollTrigger, SplitText, useGSAP }
