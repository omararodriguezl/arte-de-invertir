import { FinancialData, Analysis } from '../types'

export async function analyzeWithClaude(
  financialData: FinancialData,
  language: string
): Promise<Analysis> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ financialData, language }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `API error ${res.status}`)
  }

  const data = await res.json()
  return data.analysis as Analysis
}
