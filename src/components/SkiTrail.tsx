import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { smoothPath, type Pt } from '../lib/curves'
import { gsap, ScrollTrigger, useGSAP, withMotion } from '../lib/gsap'

/** Posizione nella pagina senza le trasformazioni delle animazioni d'entrata (che getBoundingClientRect includerebbe). */
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

/**
 * Traccia di sci fucsia che scende nel margine destro dalla hero fino alle Lezioni,
 * dove curva e finisce nella lineetta dell'etichetta "Le lezioni". Si disegna scorrendo.
 * Su schermi larghi ondeggia nel margine accanto ai testi; su telefono e tablet resta nel
 * bordo destro con un'onda più piccola, senza mai passare sopra ai testi.
 */
export function SkiTrail() {
  const { i18n } = useTranslation()
  const ref = useRef<SVGSVGElement>(null)
  const [geo, setGeo] = useState<Geo | null>(null)

  useEffect(() => {
    const main = ref.current!.parentElement!
    const measure = () => {
      const eyebrow = document.querySelector<HTMLElement>('#lezioni .eyebrow')
      const wrap = document.querySelector<HTMLElement>('#lezioni .wrap')
      const above = document.querySelector<HTMLElement>('#chi .wrap')
      if (!eyebrow || !wrap || !above) return
      const w = main.clientWidth
      // spazio tra il bordo della finestra e l'inizio dei testi
      const edge = offset(wrap).x + parseFloat(getComputedStyle(wrap).paddingLeft)
      const top = offset(main).y
      const e = offset(eyebrow)
      const end = { x: e.x + 34, y: e.y - top + eyebrow.offsetHeight / 2 }
      // spazio libero tra la fine di "Chi sono" e l'etichetta delle Lezioni: lì la traccia gira
      const gap = end.y - (offset(above).y - top + above.offsetHeight)

      // 1) onda: un coseno, sempre morbido; i picchi sono gli unici punti di svolta.
      // Ampiezza contenuta (max 46 px) e mezze onde lunghe: curve ampie anche sugli schermi molto larghi.
      const mid = w - edge * 0.5
      const amp = Math.min(46, edge * (edge >= 90 ? 0.22 : 0.3))
      const textRight = w - edge
      const xTurn = mid + amp // l'onda finisce sul lato esterno: più margine per iniziare a girare

      // 2) curva finale: un quarto di ellisse quasi rotondo, da verticale a orizzontale.
      // Il primo tratto resta nel margine, quindi può cominciare sopra lo spazio libero tra
      // "Chi sono" e "Le lezioni"; rientra fra i testi solo quando è già sotto il loro fondo.
      const inMargin = xTurn - textRight
      const maxRx = Math.max(40, (xTurn - end.x) * 0.6)
      const heightFor = (rx: number) => {
        const tIn = inMargin >= rx ? Math.PI / 2 : Math.acos(1 - inMargin / rx)
        return Math.max(80, Math.min(560, (gap * 0.9) / Math.max(0.12, 1 - Math.sin(tIn))))
      }
      let rx = maxRx
      let ry = heightFor(rx)
      // più è rotonda, più la svolta è dolce: larghezza al massimo 1,5 volte l'altezza
      rx = Math.min(maxRx, ry * 1.5)
      ry = heightFor(rx)

      const y0 = -60
      const yTurn = end.y - ry
      // mezze onde in numero pari (~360 px l'una): si parte e si arriva sul lato esterno
      const halves = Math.max(2, 2 * Math.round((yTurn - y0) / 720))
      const half = (yTurn - y0) / halves
      const pts: Pt[] = []
      for (let y = y0; y < yTurn - 5; y += 10) pts.push([mid + amp * Math.cos((Math.PI * (y - y0)) / half), y])
      pts.push([xTurn, yTurn])

      // quarto di ellisse come Bézier (k = 0,5523: approssimazione standard del cerchio),
      // poi tratto orizzontale fino alla lineetta dell'etichetta: le direzioni coincidono, niente spigoli
      const k = 0.5523
      const cx = xTurn - rx
      const yEnd = yTurn + ry
      const f = (n: number) => n.toFixed(1)
      const d =
        `${smoothPath(pts)} C${f(xTurn)} ${f(yTurn + k * ry)} ${f(cx + k * rx)} ${f(yEnd)} ${f(cx)} ${f(yEnd)}` +
        ` L${f(end.x)} ${f(end.y)}`
      const h = Math.round(end.y + 20)
      setGeo((g) => (g && g.d === d && g.w === w ? g : { w, h, d }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(main)
    return () => ro.disconnect()
  }, [i18n.resolvedLanguage])

  useGSAP(
    () => {
      if (!geo) return
      return withMotion(() => {
        gsap.fromTo(
          'path',
          { drawSVG: '0%' },
          {
            drawSVG: '100%',
            ease: 'none',
            scrollTrigger: {
              trigger: ref.current!.parentElement,
              start: 'top 75%',
              // elementi fuori dalla traccia: presi dal documento (con scope un selettore cercherebbe dentro l'svg)
              endTrigger: document.querySelector('#lezioni .eyebrow'),
              end: 'center 65%',
              scrub: 0.8,
            },
          },
        )
        ScrollTrigger.refresh()
      })
    },
    { scope: ref, dependencies: [geo], revertOnUpdate: true },
  )

  return (
    <svg ref={ref} className="ski-trail" aria-hidden="true" width={geo?.w} height={geo?.h} viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}>
      {geo && <path d={geo.d} />}
    </svg>
  )
}
