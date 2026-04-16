import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EPSPoint } from '../types'

interface Props {
  data: EPSPoint[]
}

export default function EPSChart({ data }: Props) {
  const { t } = useTranslation()
  const [animated, setAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setAnimated(true), 100)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  if (!data || data.length === 0) return null

  const values = data.map(d => d.value)
  const maxAbs = Math.max(...values.map(Math.abs), 0.01)
  const chartHeight = 140
  const barAreaHeight = chartHeight * 0.8
  const zeroY = barAreaHeight / 2

  return (
    <div ref={ref} className="card p-4 md:p-6">
      <h3 className="font-display font-semibold text-sm md:text-base text-[#F0EBE0] mb-4">
        {t('results.epsHistory')}
      </h3>

      <div className="flex items-end gap-2 md:gap-4" style={{ height: chartHeight }}>
        {data.map((point, i) => {
          const isPositive = point.value >= 0
          const pct = Math.abs(point.value) / maxAbs
          const barH = animated ? pct * barAreaHeight * 0.9 : 0
          const color = isPositive ? '#22C55E' : '#EF4444'

          return (
            <div key={point.year} className="flex-1 flex flex-col items-center gap-1">
              {/* Bar container */}
              <div
                className="w-full relative flex items-center justify-center"
                style={{ height: barAreaHeight }}
              >
                {/* Zero line */}
                <div
                  className="absolute w-full h-px bg-[#1E2A3A]"
                  style={{ top: zeroY }}
                />
                {/* Bar */}
                <div
                  className="absolute w-full rounded-sm"
                  style={{
                    height: barH,
                    background: `linear-gradient(${isPositive ? '0deg' : '180deg'}, ${color}, ${color}80)`,
                    boxShadow: `0 0 8px ${color}40`,
                    bottom: isPositive ? zeroY : undefined,
                    top: isPositive ? undefined : zeroY,
                    transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transitionDelay: `${i * 0.1}s`,
                    maxWidth: '80%',
                    marginLeft: '10%',
                  }}
                  title={`${t(isPositive ? 'results.positiveEps' : 'results.negativeEps')}: $${point.value.toFixed(2)}`}
                />
              </div>

              {/* Value */}
              <span
                className="font-data text-[10px] md:text-xs font-bold"
                style={{ color }}
              >
                ${point.value.toFixed(2)}
              </span>

              {/* Year */}
              <span className="text-[10px] md:text-xs text-[#7A8599] font-body">
                {point.year}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
