import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Criterion } from '../types'

interface Props {
  criterion: Criterion
  index: number
}

function scoreColor(score: number, max: number) {
  const pct = score / max
  if (pct >= 0.75) return '#22C55E'
  if (pct >= 0.5) return '#F59E0B'
  return '#EF4444'
}

export default function CriteriaCard({ criterion, index }: Props) {
  const { i18n } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [barWidth, setBarWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const lang = i18n.language === 'en' ? 'en' : 'es'
  const name = lang === 'en' ? criterion.nombre_en : criterion.nombre_es
  const description = lang === 'en' ? criterion.descripcion_en : criterion.descripcion_es
  const pct = (criterion.puntuacion / criterion.maximo) * 100
  const color = scoreColor(criterion.puntuacion, criterion.maximo)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          setTimeout(() => setBarWidth(pct), 100 + index * 80)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [pct, index])

  return (
    <div
      ref={ref}
      className="card p-4 md:p-5 flex flex-col gap-3 transition-all duration-300 hover:border-[rgba(201,168,76,0.2)]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-sm md:text-base text-[#F0EBE0] leading-tight">
          {name}
        </h3>
        <span
          className="font-data font-bold text-sm md:text-base whitespace-nowrap shrink-0"
          style={{ color }}
        >
          {criterion.puntuacion}
          <span className="text-[#7A8599] font-normal text-xs">/{criterion.maximo}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${barWidth}%`,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>

      {/* Description */}
      <p className="text-xs md:text-sm text-[#7A8599] leading-relaxed font-body">
        {description}
      </p>
    </div>
  )
}
