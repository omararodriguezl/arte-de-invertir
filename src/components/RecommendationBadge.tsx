import { useTranslation } from 'react-i18next'

interface Props {
  recommendation: 'BUY' | 'WAIT' | 'AVOID'
  large?: boolean
}

const config = {
  BUY: {
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.3)',
    shadow: '0 0 24px rgba(34,197,94,0.4), 0 0 80px rgba(34,197,94,0.15)',
    pulse: 'rgba(34,197,94,0.2)',
  },
  WAIT: {
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    shadow: '0 0 24px rgba(245,158,11,0.4), 0 0 80px rgba(245,158,11,0.15)',
    pulse: 'rgba(245,158,11,0.2)',
  },
  AVOID: {
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
    shadow: '0 0 24px rgba(239,68,68,0.4), 0 0 80px rgba(239,68,68,0.15)',
    pulse: 'rgba(239,68,68,0.2)',
  },
}

export default function RecommendationBadge({ recommendation, large = false }: Props) {
  const { t } = useTranslation()
  const c = config[recommendation]
  const label = t(`recommendation.${recommendation}`)

  return (
    <div
      className="inline-flex items-center justify-center rounded-2xl font-display font-bold tracking-widest uppercase"
      style={{
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: c.shadow,
        padding: large ? '16px 32px' : '10px 20px',
        fontSize: large ? '1.5rem' : '0.9rem',
        letterSpacing: '0.12em',
        minHeight: large ? '64px' : '44px',
      }}
      role="status"
      aria-label={`Recommendation: ${label}`}
    >
      {label}
    </div>
  )
}
