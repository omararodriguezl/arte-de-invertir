import { useState, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  onAnalyze: (ticker: string) => void
  onToggleLang: () => void
}

const EXAMPLES = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA']

export default function HomeScreen({ onAnalyze, onToggleLang }: Props) {
  const { t, i18n } = useTranslation()
  const [ticker, setTicker] = useState('')
  const [focused, setFocused] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const val = ticker.trim().toUpperCase()
    if (val) onAnalyze(val)
  }

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      {/* Language toggle */}
      <header className="flex justify-end p-4 md:p-6">
        <button
          onClick={onToggleLang}
          className="font-display font-bold text-xs tracking-widest px-4 py-2 rounded-lg transition-all duration-200"
          style={{
            color: '#C9A84C',
            border: '1px solid rgba(201,168,76,0.25)',
            background: 'rgba(201,168,76,0.05)',
            minHeight: '44px',
          }}
          aria-label={`Switch to ${t('lang.other')}`}
        >
          {t('lang.other')}
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16 md:pb-0">
        {/* Logo / Title */}
        <div
          className="text-center mb-12 md:mb-16 animate-slide-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          {/* Icon */}
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 mx-auto mb-6 flex items-center justify-center"
            style={{
              borderColor: 'rgba(201,168,76,0.4)',
              boxShadow: '0 0 60px rgba(201,168,76,0.1), inset 0 0 30px rgba(201,168,76,0.05)',
              background: 'rgba(201,168,76,0.04)',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <path
                d="M6 28L14 16L20 22L26 12L30 18"
                stroke="#C9A84C"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="30" cy="10" r="3" fill="#C9A84C" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-3xl md:text-5xl text-[#F0EBE0] mb-3 leading-tight tracking-tight">
            {i18n.language === 'es' ? (
              <>
                El Arte de{' '}
                <span className="gold-shimmer">Invertir</span>
              </>
            ) : (
              <>
                The Art of{' '}
                <span className="gold-shimmer">Investing</span>
              </>
            )}
          </h1>

          <p className="font-body text-[#7A8599] text-sm md:text-base max-w-md mx-auto">
            {t('app.subtitle')}
          </p>

          <p className="font-body text-[#C9A84C] text-xs mt-3 tracking-wide uppercase">
            {t('home.tagline')}
          </p>
        </div>

        {/* Search form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md animate-slide-up"
          style={{ animationDelay: '0.25s', animationFillMode: 'both' }}
        >
          {/* Input */}
          <div
            className="relative mb-4"
            style={{
              filter: focused ? 'drop-shadow(0 0 16px rgba(201,168,76,0.15))' : 'none',
              transition: 'filter 0.3s',
            }}
          >
            <input
              type="text"
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={t('home.placeholder')}
              maxLength={10}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="gold-input w-full rounded-xl text-center font-data font-bold text-lg md:text-xl tracking-widest"
              style={{ padding: '18px 24px', fontSize: '1.25rem' }}
              aria-label={t('home.placeholder')}
            />
          </div>

          {/* Analyze button */}
          <button
            type="submit"
            disabled={!ticker.trim()}
            className="btn-gold w-full rounded-xl text-sm md:text-base tracking-widest disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            style={{ padding: '16px 24px', minHeight: '56px' }}
          >
            {t('home.analyze')}
          </button>
        </form>

        {/* Examples */}
        <div
          className="mt-6 text-center animate-slide-up"
          style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
        >
          <p className="text-xs text-[#4A5568] font-body mb-3 uppercase tracking-wider">
            {t('home.exampleLabel')}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                onClick={() => {
                  setTicker(ex)
                  onAnalyze(ex)
                }}
                className="font-data text-xs font-bold px-3 py-2 rounded-lg transition-all duration-200 hover:border-[rgba(201,168,76,0.4)]"
                style={{
                  color: '#7A8599',
                  border: '1px solid #1E2A3A',
                  background: 'transparent',
                  minHeight: '36px',
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* AI badge */}
        <p
          className="mt-8 text-xs text-[#4A5568] font-body text-center animate-slide-up"
          style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
        >
          ✦ {t('home.poweredBy')}
        </p>
      </main>

      {/* Footer disclaimer */}
      <footer className="px-6 pb-6 text-center">
        <p className="text-[11px] text-[#3A4558] font-body max-w-sm mx-auto">
          {t('home.disclaimer')}
        </p>
      </footer>
    </div>
  )
}
