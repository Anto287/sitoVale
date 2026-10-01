import { useRef, type CSSProperties } from 'react'
import { EASE_OUT, gsap, SplitText, useGSAP, withMotion } from '../lib/gsap'

type Props = {
  text: string
  as?: 'h2' | 'h3'
  className?: string
  style?: CSSProperties
}

/**
 * Titolo che entra riga per riga da sotto una maschera.
 * Il `key` sul testo fa rimontare l'elemento al cambio lingua: SplitText
 * lavora su un nodo nuovo e React non si trova mai il DOM modificato sotto i piedi.
 */
export function SplitHeading(props: Props) {
  return <SplitHeadingInner key={props.text} {...props} />
}

function SplitHeadingInner({ text, as: Tag = 'h2', className, style }: Props) {
  const ref = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () =>
      withMotion(() => {
        const el = ref.current!
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 115,
              duration: 0.9,
              ease: EASE_OUT,
              stagger: 0.1,
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }),
        })
      }),
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className} style={style}>
      {text}
    </Tag>
  )
}
