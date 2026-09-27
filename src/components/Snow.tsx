import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, withMotion } from '../lib/gsap'

type Flake = { x: number; y: number; r: number; s: number; d: number; o: number }

/** Neve leggera sulla hero. Gira sul ticker di GSAP e si ferma fuori schermo. */
export function Snow() {
  const ref = useRef<HTMLCanvasElement>(null)

  useGSAP(
    () =>
      withMotion(() => {
        const canvas = ref.current!
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        // I fiocchi sono puntini sfocati: oltre 1,5× di densità non si vede differenza, si paga solo in GPU.
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
        let w = 0
        let h = 0
        let flakes: Flake[] = []

        // Le misure si leggono dalla hero, non dal canvas: il canvas cambia risoluzione
        // qui dentro e non deve mai essere lui a decidere quanto è grande.
        const box = canvas.parentElement!
        const size = () => {
          w = box.clientWidth
          h = box.clientHeight
          canvas.width = w * dpr
          canvas.height = h * dpr
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          flakes = Array.from({ length: Math.min(70, Math.round(w / (w < 700 ? 30 : 24))) }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.9 + 0.5,
            s: Math.random() * 0.35 + 0.12,
            d: Math.random() * Math.PI * 2,
            o: Math.random() * 0.4 + 0.18,
          }))
        }

        // deltaRatio mantiene la stessa velocità a 60, 120 o 144 Hz
        const tick = () => {
          const k = gsap.ticker.deltaRatio(60)
          ctx.clearRect(0, 0, w, h)
          ctx.fillStyle = '#fff'
          for (const f of flakes) {
            f.y += f.s * k
            f.d += 0.006 * k
            f.x += Math.sin(f.d) * 0.28 * k
            if (f.y > h) {
              f.y = -6
              f.x = Math.random() * w
            }
            ctx.globalAlpha = f.o
            ctx.beginPath()
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.globalAlpha = 1
        }

        size()
        const ro = new ResizeObserver(size)
        ro.observe(box)

        let running = false
        const run = (on: boolean) => {
          if (on === running) return
          running = on
          if (on) gsap.ticker.add(tick)
          else gsap.ticker.remove(tick)
        }
        ScrollTrigger.create({
          trigger: canvas,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => run(self.isActive),
        })
        run(true)

        return () => {
          run(false)
          ro.disconnect()
        }
      }),
    { scope: ref },
  )

  return <canvas ref={ref} id="snow" aria-hidden="true" />
}
