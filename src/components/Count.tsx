import { useRef } from 'react'
import { gsap, useGSAP, withMotion } from '../lib/gsap'

// fr-FR raggruppa le migliaia con lo spazio fine: "1 600", "3 226"
const fmt = new Intl.NumberFormat('fr-FR')

/** Numero che conta fino al valore finale quando entra nel viewport. */
export function Count({ to, duration = 2.2 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)

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
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: () => {
            el.textContent = fmt.format(Math.round(state.v))
          },
        })
        return () => {
          el.textContent = fmt.format(to)
        }
      }),
    { scope: ref },
  )

  return <span ref={ref}>{fmt.format(to)}</span>
}
