import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RESORTS, type PlaceId } from '../data/places'
import { smoothPath, type Pt } from '../lib/curves'
import { EASE_OUT, gsap, useGSAP, withMotion } from '../lib/gsap'

/*
 * Mappa stilizzata della Tarentaise. Le posizioni vengono dalle coordinate reali
 * (x = (longitudine − 6,33°) × 700, y = (45,87° − latitudine) × 1000): distanze e direzioni
 * sono giuste, il disegno è volutamente essenziale. Il confine con l'Italia è indicativo.
 */
const RIVER: Pt[] = [
  [44, 194], // Albertville
  [141, 385], // Moûtiers
  [224, 315], // Aime
  [307, 251], // Bourg-Saint-Maurice
  [387, 282], // Sainte-Foy-Tarentaise
  [422, 370], // lago del Chevril
  [455, 421], // Val d'Isère
]
const BORDER: Pt[] = [
  [375, 37],
  [336, 120],
  [388, 190],
  [469, 270],
  [511, 390],
]

const RIVER_D = smoothPath(RIVER)
const BORDER_D = smoothPath(BORDER)

const TOWNS = [
  { name: 'Albertville', x: 44, y: 194, lx: 44, ly: 180, anchor: 'middle' },
  { name: 'Moûtiers', x: 141, y: 385, lx: 141, ly: 407, anchor: 'middle' },
  { name: 'Aime', x: 224, y: 315, lx: 216, ly: 305, anchor: 'end' },
  { name: 'Bourg-St-Maurice', x: 307, y: 251, lx: 297, ly: 240, anchor: 'end' },
] as const

const PEAKS = [
  { name: 'Aiguille Rouge', alt: '3226 m', x: 372, y: 335, lx: 360, ly: 354, anchor: 'end' },
  { name: 'Grande Motte', alt: '3456 m', x: 402, y: 431, lx: 390, ly: 452, anchor: 'end' },
] as const


const peak = (x: number, y: number, s = 9) => `M${x - s} ${y + s * 0.75} L${x} ${y - s * 0.85} L${x + s} ${y + s * 0.75} Z`

/** Mappa che si disegna entrando: la valle dell'Isère, poi paesi, cime e le tre stazioni. */
export function TarentaiseMap({ active, onHover }: { active: PlaceId | null; onHover: (id: PlaceId | null) => void }) {
  const { t } = useTranslation()
  const ref = useRef<SVGSVGElement>(null)
  // Telefono: la mappa è larga ~330 px, le scritte piccole sparirebbero. Restano stazioni,
  // fiume e Monte Bianco, con nomi più grandi (la pagina pre-generata parte dalla versione desktop).
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)')
    const sync = () => setCompact(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useGSAP(
    () =>
      withMotion(() => {
        gsap
          .timeline({ defaults: { ease: EASE_OUT }, scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true } })
          // linee tratteggiate in dissolvenza: DrawSVG userebbe lo stesso stroke-dasharray e il tratteggio sparirebbe
          .from('.map-border', { autoAlpha: 0, duration: 1.4 }, 0.4)
          .from('.map-river', { drawSVG: '0%', duration: 2.2, ease: 'power2.inOut' }, 0.1)
          .from('.map-town', { autoAlpha: 0, y: 6, duration: 0.6, stagger: 0.18 }, 0.5)
          .from('.map-peak', { autoAlpha: 0, y: 10, duration: 0.8, stagger: 0.12 }, 1.1)
          .from('.map-funicular', { autoAlpha: 0, duration: 0.6 }, 1.5)
          .from('.map-resort-dot', { scale: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(2.2)', stagger: 0.15 }, 1.7)
          .from('.map-resort text', { autoAlpha: 0, x: -8, duration: 0.8, stagger: 0.15 }, 1.85)
          .from('.map-extra', { autoAlpha: 0, duration: 0.8 }, 2)
      }),
    { scope: ref },
  )

  return (
    <svg ref={ref} className={`map${compact ? ' map--compact' : ''}`} viewBox={compact ? '0 0 580 490' : '0 0 580 470'} role="img" aria-label={t('where.mapLabel')}>
      <g className="map-extra" aria-hidden="true">
        <path d="M30 58 L30 30 M24 38 L30 28 L36 38" className="map-north" />
        <text x="30" y="74" textAnchor="middle" className="map-small">
          N
        </text>
        <text x="482" y="232" className="map-small map-country">
          {t('where.mapItaly')}
        </text>
        <text x="66" y="292" className="map-river-label" transform="rotate(62 66 292)">
          Isère
        </text>
        {/* legenda */}
        <g className="map-legend">
          <path d="M24 430 H52" className="map-funicular" />
          <text x="62" y="434" className="map-small map-funicular-label">
            {t('where.mapFunicular')}
          </text>
          <path d="M24 452 H52" className="map-border" />
          <text x="62" y="456" className="map-small">
            {t('where.mapBorder')}
          </text>
        </g>
      </g>
      <path d={BORDER_D} className="map-border" />
      <path d={RIVER_D} className="map-river" />

      {TOWNS.map((town) => (
        <g key={town.name} className="map-town">
          <circle cx={town.x} cy={town.y} r="3" />
          <text x={town.lx} y={town.ly} textAnchor={town.anchor} className="map-small">
            {town.name}
          </text>
        </g>
      ))}

      <path d="M307 251 L329 284" className="map-funicular" />

      <g className="map-peak">
        <path d={peak(375, 37, 13)} />
        <text x="394" y="34" className="map-peak-name">
          {t('where.mapMontBlanc')}
        </text>
        <text x="394" y="53" className="map-small">
          4808 m
        </text>
      </g>
      {PEAKS.map((p) => (
        <g key={p.name} className="map-peak">
          <path d={peak(p.x, p.y)} />
          <text x={p.lx} y={p.ly} textAnchor={p.anchor} className="map-small">
            {p.name} · {p.alt}
          </text>
        </g>
      ))}

      {RESORTS.map((r) => {
        const label = compact ? r.compact : r
        return (
          <g
            key={r.id}
            className={`map-resort${active === r.id ? ' is-active' : ''}`}
            onPointerEnter={() => onHover(r.id)}
            onPointerLeave={() => onHover(null)}
          >
            <g className="map-resort-dot">
              <circle cx={r.x} cy={r.y} r="14" className="map-halo" />
              <circle cx={r.x} cy={r.y} r="6" />
            </g>
            <text x={label.lx} y={label.ly} textAnchor={label.anchor}>
              {r.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
