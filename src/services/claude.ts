import { FinancialData, Analysis } from '../types'

export async function analyzeWithClaude(
  ticker: string,
  language: string
): Promise<{ financialData: FinancialData; analysis: Analysis }> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker, language }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `API error ${res.status}`)
  }

  const data = await res.json()
  return { financialData: data.financialData, analysis: data.analysis }
}
