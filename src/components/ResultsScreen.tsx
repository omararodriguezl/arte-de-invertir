import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FinancialData, Analysis, StockType } from '../types'
import CircularGauge from './CircularGauge'
import RecommendationBadge from './RecommendationBadge'
import CriteriaCard from './CriteriaCard'
import EPSChart from './EPSChart'
import { generatePDF } from '../utils/pdf'

interface Props {
  financialData: FinancialData
  analysis: Analysis
  onBack: () => void
  onToggleLang: () => void
}

function StatChip({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="card-elevated flex flex-col items-center justify-center p-3 md:p-4 gap-1 min-w-[80px]">
      <span className="font-data font-bold text-base md:text-lg" style={{ color: valueColor || '#F0EBE0' }}>
        {value}
      </span>
      <span className="text-[10px] md:text-xs text-[#7A8599] font-body text-center">{label}</span>
    </div>
  )
}

const PER_BENCHMARKS: Record<StockType, string> = {
  ESTABLE_ALTO_CRECIMIENTO: '20x–35x',
  ESTABLE_BAJO_CRECIMIENTO: '15x–25x',
  CICLICA_ALTO_CRECIMIENTO: '10x–15x',
  CICLICA_BAJO_CRECIMIENTO: '5x–10x',
}

function StockTypeBadge({ tipo, lang }: { tipo: StockType; lang: string }) {
  const { t } = useTranslation()
  const label = t(`results.stockTypes.${tipo}`, { defaultValue: tipo.replace(/_/g, ' ') })
  const benchmark = PER_BENCHMARKS[tipo]
  const isEstable = tipo.startsWith('ESTABLE')
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-display font-semibold tracking-wide"
        style={{
          background: isEstable ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
          color: isEstable ? '#22C55E' : '#F59E0B',
          border: `1px solid ${isEstable ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
        }}
      >
        <span>{isEstable ? '◆' : '◇'}</span>
        {label}
      </span>
      <span className="text-[11px] text-[#7A8599] font-body">
        PER ref: <span className="text-[#C9A84C] font-data font-bold">{benchmark}</span>
      </span>
    </div>
  )
}

export default function ResultsScreen({ financialData, analysis, onBack, onToggleLang }: Props) {
  const { t, i18n } = useTranslation()
  const [downloading, setDownloading] = useState(false)
  const lang = i18n.language === 'en' ? 'en' : 'es'

  const rec = analysis.recomendacion_en
  const summary = lang === 'en' ? analysis.resumen_ejecutivo_en : analysis.resumen_ejecutivo_es
  const just = lang === 'en' ? analysis.justificacion_en : analysis.justificacion_es
  const risks = lang === 'en' ? analysis.riesgos_en : analysis.riesgos_es

  const today = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await generatePDF(financialData, analysis, lang as 'es' | 'en')
    } catch (e) {
      console.error('PDF error:', e)
    }
    setDownloading(false)
  }

  return (
    <div className="min-h-screen mesh-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 md:px-6"
        style={{ background: 'rgba(7,10,14,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1E2A3A' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#7A8599] hover:text-[#C9A84C] transition-colors font-body text-sm"
          style={{ minHeight: '44px' }}
          aria-label={t('results.back')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">{t('results.back')}</span>
        </button>

        <span className="font-display font-bold text-sm gold-shimmer">
          {financialData.ticker}
        </span>

        <button
          onClick={onToggleLang}
          className="font-display font-bold text-xs tracking-widest px-3 py-2 rounded-lg transition-all duration-200"
          style={{ color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)', background: 'rgba(201,168,76,0.05)', minHeight: '44px' }}
        >
          {t('lang.other')}
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">

        {/* Hero card */}
        <section className="card-elevated p-5 md:p-7 animate-slide-up space-y-5">
          {/* Company info */}
          <div>
            <h1 className="font-display font-bold text-xl md:text-2xl text-[#F0EBE0] leading-tight">
              {financialData.companyName}
            </h1>
            <p className="text-sm text-[#7A8599] font-body mt-1">
              {financialData.sector} · {t('results.analysisDate')}: {today}
            </p>
          </div>

          {/* Stock type classification */}
          {analysis.tipo_accion && (
            <StockTypeBadge tipo={analysis.tipo_accion} lang={lang} />
          )}

          {/* Key stats row */}
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            <StatChip label={t('results.price')} value={`$${financialData.currentPrice.toFixed(2)}`} valueColor="#C9A84C" />
            <StatChip label={t('results.per')} value={financialData.per > 0 ? financialData.per.toFixed(1) : 'N/A'} />
            <StatChip label={t('results.roe')} value={`${financialData.roe.toFixed(1)}%`} />
            <StatChip label={lang === 'en' ? 'Net Margin' : 'Margen Neto'} value={`${financialData.netMargin.toFixed(1)}%`} />
          </div>

          {/* Recommendation + Score */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs text-[#7A8599] uppercase tracking-wider font-body">
                {t('results.recommendation')}
              </span>
              <RecommendationBadge recommendation={rec} large />
            </div>

            <div className="hidden sm:block w-px h-20 bg-[#1E2A3A]" />

            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-[#7A8599] uppercase tracking-wider font-body">
                {t('results.score')}
              </span>
              <CircularGauge score={analysis.puntuacion_total} size={140} />
            </div>
          </div>
        </section>

        {/* Executive summary */}
        <section className="card p-5 md:p-6 animate-slide-up space-y-3" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-display font-semibold text-sm md:text-base text-[#C9A84C] uppercase tracking-wider">
            {t('results.executiveSummary')}
          </h2>
          <p className="font-body text-sm md:text-base text-[#B0A898] leading-relaxed">
            {summary}
          </p>
        </section>

        {/* Criteria grid */}
        <section className="space-y-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="font-display font-semibold text-sm md:text-base text-[#C9A84C] uppercase tracking-wider px-1">
            {t('results.criteria')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.criterios.map((c, i) => (
              <CriteriaCard key={i} criterion={c} index={i} />
            ))}
          </div>
        </section>

        {/* EPS Chart */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <EPSChart data={financialData.eps} />
        </section>

        {/* Risks */}
        <section className="card p-5 md:p-6 animate-slide-up space-y-4" style={{ animationDelay: '0.25s' }}>
          <h2 className="font-display font-semibold text-sm md:text-base text-[#C9A84C] uppercase tracking-wider">
            {t('results.risks')}
          </h2>
          <ul className="space-y-3">
            {risks.map((risk, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-data font-bold mt-0.5"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {i + 1}
                </span>
                <p className="font-body text-sm text-[#B0A898] leading-relaxed">{risk}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Justification */}
        <section className="card p-5 md:p-6 animate-slide-up space-y-3" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-display font-semibold text-sm md:text-base text-[#C9A84C] uppercase tracking-wider">
            {t('results.justification')}
          </h2>
          <p className="font-body text-sm md:text-base text-[#B0A898] leading-relaxed">
            {just}
          </p>
        </section>

        {/* Download PDF */}
        <section className="animate-slide-up pb-8" style={{ animationDelay: '0.35s' }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-gold w-full rounded-xl flex items-center justify-center gap-3 disabled:opacity-60"
            style={{ padding: '18px 24px', minHeight: '60px' }}
          >
            {downloading ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {t('pdf.generating')}
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M9 2v10M5 8l4 4 4-4M3 14h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t('results.download')}
              </>
            )}
          </button>

          <p className="text-[11px] text-[#3A4558] font-body text-center mt-4">
            {t('home.disclaimer')}
          </p>
        </section>
      </main>
    </div>
  )
}
