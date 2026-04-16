import { FinancialData, EPSPoint } from '../types'

const BASE = 'https://financialmodelingprep.com/api/v3'
const KEY = import.meta.env.VITE_FMP_API_KEY

async function fmpFetch(path: string) {
  const sep = path.includes('?') ? '&' : '?'
  const res = await fetch(`${BASE}${path}${sep}apikey=${KEY}`)
  if (!res.ok) throw new Error(`FMP error ${res.status}`)
  return res.json()
}

export async function fetchFinancialData(ticker: string): Promise<FinancialData> {
  const symbol = ticker.toUpperCase().trim()

  const [quote, profile, income, ratiosTTM, metricsTTM] = await Promise.all([
    fmpFetch(`/quote/${symbol}`),
    fmpFetch(`/profile/${symbol}`),
    fmpFetch(`/income-statement/${symbol}?limit=5`),
    fmpFetch(`/ratios-ttm/${symbol}`),
    fmpFetch(`/key-metrics-ttm/${symbol}`),
  ])

  if (!quote || !Array.isArray(quote) || quote.length === 0) {
    throw new Error('INVALID_TICKER')
  }

  const q = quote[0]
  const p = Array.isArray(profile) && profile.length > 0 ? profile[0] : {}
  const r = Array.isArray(ratiosTTM) && ratiosTTM.length > 0 ? ratiosTTM[0] : {}
  const m = Array.isArray(metricsTTM) && metricsTTM.length > 0 ? metricsTTM[0] : {}

  const eps: EPSPoint[] = Array.isArray(income)
    ? income
        .slice(0, 5)
        .map((stmt: Record<string, unknown>) => ({
          year: new Date(stmt.date as string).getFullYear(),
          value: typeof stmt.eps === 'number' ? stmt.eps : 0,
        }))
        .reverse()
    : []

  return {
    ticker: symbol,
    companyName: q.name || p.companyName || symbol,
    sector: p.sector || 'N/A',
    currentPrice: q.price ?? 0,
    per: q.pe ?? 0,
    eps,
    roe: (r.returnOnEquityTTM ?? 0) * 100,
    debtToEbitda: m.netDebtToEBITDATTM ?? 0,
    freeCashFlow: m.freeCashFlowPerShareTTM ?? 0,
    netMargin: (r.netProfitMarginTTM ?? 0) * 100,
  }
}
