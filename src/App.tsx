import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, FinancialData, Analysis } from './types'
import HomeScreen from './components/HomeScreen'
import LoadingScreen from './components/LoadingScreen'
import ResultsScreen from './components/ResultsScreen'
import { fetchFinancialData } from './services/fmp'
import { analyzeWithClaude } from './services/claude'

type ErrorType = 'invalidTicker' | 'fmpError' | 'claudeError' | 'networkError' | 'genericError'

export default function App() {
  const { t, i18n } = useTranslation()
  const [appState, setAppState] = useState<AppState>('home')
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [errorKey, setErrorKey] = useState<ErrorType>('genericError')
  const [lastTicker, setLastTicker] = useState('')

  const toggleLang = () => {
    const next = i18n.language === 'es' ? 'en' : 'es'
    i18n.changeLanguage(next)
    localStorage.setItem('language', next)
  }

  const handleAnalyze = async (ticker: string) => {
    setLastTicker(ticker)
    setAppState('loading')
    setFinancialData(null)
    setAnalysis(null)

    try {
      const data = await fetchFinancialData(ticker)
      setFinancialData(data)

      const result = await analyzeWithClaude(data, i18n.language)
      setAnalysis(result)
      setAppState('results')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)

      if (msg === 'INVALID_TICKER' || msg.includes('not found')) {
        setErrorKey('invalidTicker')
      } else if (msg.includes('FMP') || msg.includes('fetch')) {
        setErrorKey('fmpError')
      } else if (msg.includes('Claude') || msg.includes('analyze') || msg.includes('API')) {
        setErrorKey('claudeError')
      } else if (msg.includes('network') || msg.includes('NetworkError') || msg.includes('Failed to fetch')) {
        setErrorKey('networkError')
      } else {
        setErrorKey('genericError')
      }

      setAppState('error')
    }
  }

  if (appState === 'home') {
    return <HomeScreen onAnalyze={handleAnalyze} onToggleLang={toggleLang} />
  }

  if (appState === 'loading') {
    return <LoadingScreen />
  }

  if (appState === 'results' && financialData && analysis) {
    return (
      <ResultsScreen
        financialData={financialData}
        analysis={analysis}
        onBack={() => setAppState('home')}
        onToggleLang={toggleLang}
      />
    )
  }

  // Error state
  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="card p-8 max-w-sm w-full space-y-5 animate-slide-up">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 8v5M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-lg text-[#F0EBE0]">
            {lastTicker || 'Error'}
          </h2>
          <p className="font-body text-sm text-[#7A8599]">
            {t(`error.${errorKey}`)}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleAnalyze(lastTicker)}
            className="btn-gold w-full rounded-xl text-sm"
            style={{ padding: '14px 20px', minHeight: '48px' }}
          >
            {t('error.retry')}
          </button>
          <button
            onClick={() => setAppState('home')}
            className="w-full rounded-xl text-sm font-body transition-all duration-200 hover:text-[#C9A84C]"
            style={{
              color: '#7A8599',
              border: '1px solid #1E2A3A',
              padding: '14px 20px',
              minHeight: '48px',
            }}
          >
            {t('error.backHome')}
          </button>
        </div>
      </div>
    </div>
  )
}
