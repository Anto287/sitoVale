import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { smoothPath, type Pt } from '../lib/curves'
import { gsap, RICH_MOTION, ScrollTrigger, useGSAP, withRichMotion } from '../lib/gsap'

function offset(el: HTMLElement | null) {
  let x = 0
  let y = 0
  for (; el; el = el.offsetParent as HTMLElement | null) {
    x += el.offsetLeft
    y += el.offsetTop
  }
  return { x, y }
}

type Geo = { w: number; h: number; d: string }

export function SkiTrail() {
  const { i18n } = useTranslation()
  const ref = useRef<SVGSVGElement>(null)
  const [geo, setGeo] = useState<Geo | null>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(RICH_MOTION)
    const sync = () => setEnabled(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const main = ref.current!.parentElement!
    const measure = () => {
      const eyebrow = document.querySelector<HTMLElement>('#lezioni .eyebrow')
      const wrap = document.querySelector<HTMLElement>('#lezioni .wrap')
      const above = document.querySelector<HTMLElement>('#chi .wrap')
      if (!eyebrow || !wrap || !above) return
      const w = main.clientWidth
      const edge = offset(wrap).x + parseFloat(getComputedStyle(wrap).paddingLeft)
      const top = offset(main).y
      const e = offset(eyebrow)
      const end = { x: e.x - 14, y: e.y - top + eyebrow.offsetHeight / 2 }
      const clearance = eyebrow.offsetHeight / 2 + 18
      const approach = { x: end.x + clearance, y: end.y - clearance }
      const gap = approach.y - (offset(above).y - top + above.offsetHeight)

      const mid = w - edge * 0.5
      const amp = Math.min(46, edge * (edge >= 90 ? 0.22 : 0.3))
      const textRight = w - edge
      const xTurn = mid + amp

      const inMargin = xTurn - textRight
      const maxRx = Math.max(40, (xTurn - approach.x) * 0.6)
      const heightFor = (rx: number) => {
        const tIn = inMargin >= rx ? Math.PI / 2 : Math.acos(1 - inMargin / rx)
        return Math.max(80, Math.min(560, (gap * 0.9) / Math.max(0.12, 1 - Math.sin(tIn))))
      }
      let rx = maxRx
      let ry = heightFor(rx)
      rx = Math.min(maxRx, ry * 1.5)
      ry = heightFor(rx)

      const y0 = -60
      const yTurn = approach.y - ry
      const halves = Math.max(2, 2 * Math.round((yTurn - y0) / 720))
      const half = (yTurn - y0) / halves
      const pts: Pt[] = []
      for (let y = y0; y < yTurn - 5; y += 10) pts.push([mid + amp * Math.cos((Math.PI * (y - y0)) / half), y])
      pts.push([xTurn, yTurn])

      const k = 0.5523
      const cx = xTurn - rx
      const yEnd = yTurn + ry
      const f = (n: number) => n.toFixed(1)
      const d =
        `${smoothPath(pts)} C${f(xTurn)} ${f(yTurn + k * ry)} ${f(cx + k * rx)} ${f(yEnd)} ${f(cx)} ${f(yEnd)}` +
        ` L${f(approach.x)} ${f(approach.y)} Q${f(end.x)} ${f(approach.y)} ${f(end.x)} ${f(end.y)}`
      const h = Math.round(end.y + 20)
      setGeo((g) => (g && g.d === d && g.w === w ? g : { w, h, d }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(main)
    return () => ro.disconnect()
  }, [i18n.resolvedLanguage, enabled])

  useGSAP(
    () => {
      if (!geo) return
      return withRichMotion(() => {
        gsap.fromTo(
          'path',
          { drawSVG: '0%' },
          {
            drawSVG: '100%',
            ease: 'none',
            scrollTrigger: {
              trigger: ref.current!.parentElement,
              start: 'top 75%',
              endTrigger: document.querySelector('#lezioni .eyebrow'),
              end: 'center 65%',
              scrub: 0.25,
            },
          },
        )
        ScrollTrigger.refresh()
      })
    },
    { scope: ref, dependencies: [geo], revertOnUpdate: true },
  )

  if (!enabled) return null

  return (
    <svg ref={ref} className="ski-trail" aria-hidden="true" width={geo?.w} height={geo?.h} viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}>
      {geo && <path d={geo.d} />}
    </svg>
  )
}
