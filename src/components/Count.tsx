import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP, withMotion } from '../lib/gsap'

export function Count({ to, decimals = 0, duration = 1.6 }: { to: number; decimals?: number; duration?: number }) {
  const { i18n } = useTranslation()
  const ref = useRef<HTMLSpanElement>(null)
  const fmt = new Intl.NumberFormat(i18n.resolvedLanguage, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

  useGSAP(
    () =>
      withMotion(() => {
        const el = ref.current!
        const state = { v: 0 }
        el.textContent = fmt.format(0)
        gsap.to(state, {
          v: to,
          duration,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 95%', once: true },
          onUpdate: () => {
            el.textContent = fmt.format(decimals ? state.v : Math.round(state.v))
          },
        })
        return () => {
          el.textContent = fmt.format(to)
        }
      }),
    { scope: ref, dependencies: [to, i18n.resolvedLanguage], revertOnUpdate: true },
  )

  return (
    <span ref={ref} suppressHydrationWarning>
      {fmt.format(to)}
    </span>
  )
}
