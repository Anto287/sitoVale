import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CONTACT } from '../config'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'

/**
 * Solo telefono: barra fissa in basso con "Prenota" e WhatsApp.
 * Compare dopo la hero e sparisce quando si arriva ai contatti, dove non serve più.
 */
export function MobileCta() {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(max-width: 700px)', () => {
        const bar = ref.current!
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const show = (on: boolean) =>
          gsap.to(bar, { yPercent: on ? 0 : 130, autoAlpha: on ? 1 : 0, duration: reduce ? 0 : 0.5, ease: on ? 'power3.out' : 'power2.in', overwrite: true })
        gsap.set(bar, { yPercent: 130, autoAlpha: 0 })
        // elementi presi dal documento: con `scope` un selettore testuale cercherebbe solo dentro la barra
        ScrollTrigger.create({
          trigger: document.getElementById('top'),
          start: 'bottom 60%',
          endTrigger: document.getElementById('contatti'),
          end: 'top bottom',
          onToggle: (self) => show(self.isActive),
        })
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="mobile-cta">
      <a className="btn btn--accent" href="#contatti">
        {t('mobileCta.book')}
      </a>
      <a className="mobile-cta-wa" href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-4A8 8 0 1 1 20 12z" />
        </svg>
      </a>
    </div>
  )
}
