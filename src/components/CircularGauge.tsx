import { useEffect, useState } from 'react'

interface Props {
  score: number
  size?: number
}

export default function CircularGauge({ score, size = 160 }: Props) {
  const [animated, setAnimated] = useState(0)
  const strokeWidth = 10
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const offset = circumference - (animated / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 75) return '#22C55E'
    if (s >= 50) return '#F59E0B'
    return '#EF4444'
  }

  const color = getColor(score)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
        aria-label={`Score: ${score} out of 100`}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1E2A3A"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: `drop-shadow(0 0 8px ${color}80)`,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-data font-bold leading-none"
          style={{ fontSize: size * 0.22, color }}
        >
          {score}
        </span>
        <span className="text-xs font-body text-[#7A8599] mt-1">/ 100</span>
      </div>
    </div>
  )
}
