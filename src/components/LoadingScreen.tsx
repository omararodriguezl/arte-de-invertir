import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function LoadingScreen() {
  const { t, i18n } = useTranslation()
  const messages: string[] = t('loading.messages', { returnObjects: true }) as string[]
  const [msgIndex, setMsgIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setMsgIndex(prev => (prev + 1) % messages.length)
        setFade(true)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [messages.length, i18n.language])

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-6">
      {/* Animated logo */}
      <div className="mb-12 text-center animate-slide-up">
        <div
          className="w-20 h-20 rounded-full border-2 mx-auto mb-6 flex items-center justify-center"
          style={{
            borderColor: 'rgba(201,168,76,0.3)',
            boxShadow: '0 0 40px rgba(201,168,76,0.15)',
          }}
        >
          <span className="text-3xl font-display font-bold gold-shimmer">A</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[#F0EBE0]">
          {t('loading.title')}
        </h1>
      </div>

      {/* Spinner */}
      <div className="spinner mb-10" />

      {/* Rotating message */}
      <p
        className="font-body text-[#7A8599] text-sm md:text-base text-center max-w-xs transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {messages[msgIndex]}
      </p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {messages.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === msgIndex ? '#C9A84C' : '#1E2A3A',
              transform: i === msgIndex ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Time estimate */}
      <p className="text-xs text-[#4A5568] mt-8 font-body text-center">
        {i18n.language === 'es'
          ? 'El análisis tarda entre 15 y 30 segundos'
          : 'Analysis takes between 15 and 30 seconds'}
      </p>
    </div>
  )
}
