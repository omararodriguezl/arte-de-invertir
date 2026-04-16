const Anthropic = require('@anthropic-ai/sdk')
const YahooFinance = require('yahoo-finance2').default
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── YAHOO FINANCE DATA FETCHER ────────────────────────────────────────────

async function fetchYahooData(symbol) {
  // Fetch summary and EPS time series in parallel
  const fiveYearsAgo = new Date()
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 6)
  const period1 = fiveYearsAgo.toISOString().slice(0, 10)

  let summary, timeSeries
  try {
    ;[summary, timeSeries] = await Promise.all([
      yahooFinance.quoteSummary(symbol, {
        modules: ['price', 'assetProfile', 'financialData', 'defaultKeyStatistics'],
      }),
      yahooFinance.fundamentalsTimeSeries(symbol, { type: 'annual', period1 }).catch(() => []),
    ])
  } catch (err) {
    if (err.message?.includes('No fundamentals') || err.message?.includes('Not Found') || err.message?.includes('404')) {
      throw new Error('INVALID_TICKER')
    }
    throw err
  }

  if (!summary) throw new Error('INVALID_TICKER')

  const price = summary.price || {}
  const profile = summary.assetProfile || {}
  const financial = summary.financialData || {}
  const keyStats = summary.defaultKeyStatistics || {}

  const currentPrice = price.regularMarketPrice ?? 0
  const companyName = price.longName || price.shortName || symbol
  const sector = profile.sector || 'N/A'
  const per = price.trailingPE ?? 0
  const roe = (financial.returnOnEquity ?? 0) * 100
  const netMargin = (financial.profitMargins ?? 0) * 100

  const sharesOutstanding = keyStats.sharesOutstanding ?? 1
  const freeCashFlowTotal = financial.freeCashflow ?? 0
  const freeCashFlow = freeCashFlowTotal / sharesOutstanding

  const totalDebt = financial.totalDebt ?? 0
  const ebitda = financial.ebitda ?? 1
  const debtToEbitda = ebitda !== 0 ? totalDebt / ebitda : 0

  // EPS from fundamentalsTimeSeries (annualBasicEPS field)
  const eps = Array.isArray(timeSeries)
    ? timeSeries
        .filter(row => row.annualBasicEPS != null)
        .slice(-5)
        .map(row => ({
          year: new Date(row.date).getFullYear(),
          value: row.annualBasicEPS,
        }))
    : []

  return {
    ticker: symbol,
    companyName,
    sector,
    currentPrice,
    per,
    eps,
    roe,
    debtToEbitda,
    freeCashFlow,
    netMargin,
  }
}

// ─── CLAUDE PROMPT ─────────────────────────────────────────────────────────

function buildPrompt(financialData) {
  const { ticker, companyName, sector, currentPrice, per, eps, roe, debtToEbitda, freeCashFlow, netMargin } = financialData

  const epsText = eps.map(e => `${e.year}: $${e.value.toFixed(2)}`).join(', ')

  const epsValues = eps.map(e => e.value).filter(v => !isNaN(v))
  const epsGrowthNote = epsValues.length >= 2
    ? `Trend: from $${epsValues[epsValues.length - 1].toFixed(2)} to $${epsValues[0].toFixed(2)} (most recent first)`
    : ''

  return `You are an expert value investor. Your analysis framework comes EXCLUSIVELY from the book "El Arte de Invertir" by Alejandro Estebaranz (founder of True Value Investments). Apply his exact methodology as described below — do not deviate.

═══════════════════════════════════════════
COMPANY DATA
═══════════════════════════════════════════
Company: ${companyName} (${ticker})
Sector: ${sector}
Current Price: $${currentPrice}
P/E Ratio (PER): ${per > 0 ? per.toFixed(1) : 'N/A (negative earnings)'}
ROE: ${roe.toFixed(1)}%
Net Debt / EBITDA: ${debtToEbitda.toFixed(2)}x
Free Cash Flow per Share: $${freeCashFlow.toFixed(2)}
Net Margin: ${netMargin.toFixed(1)}%
EPS / BPA History (most recent first): ${epsText}
${epsGrowthNote}

═══════════════════════════════════════════
ESTEBARANZ METHODOLOGY — APPLY STRICTLY
═══════════════════════════════════════════

## STEP 1 — BUFFETT'S 4 PILLARS (Estebaranz Chapter 5)
Before scoring, verify all 4 conditions:
1. Can we understand how this business will make money in 5-10 years?
2. Does it have sustainable growth and durable competitive advantages?
3. Is management honest and competent, aligned with shareholders?
4. Is the price attractive for the type of stock it is?

## STEP 2 — CLASSIFY THE STOCK (Estebaranz Chapter 8)
Determine stock type — this sets the correct PER benchmark:
- CÍCLICA + BAJO CRECIMIENTO: commodity-like, cyclical industry, EPS inconsistent → PER benchmark 5x–10x
- CÍCLICA + ALTO CRECIMIENTO: cyclical but growing fast → PER benchmark 10x–15x
- ESTABLE + BAJO CRECIMIENTO: recession-resistant, low volatility, modest growth → PER benchmark 15x–25x
- ESTABLE + ALTO CRECIMIENTO: recession-resistant + >10% annual EPS growth → PER benchmark 20x–35x (MOST VALUABLE per Estebaranz)

## STEP 3 — BPA (EPS) AS PRIMARY METRIC (Estebaranz Chapter 7)
"At 10 years, 90% of a stock's return is explained by EPS evolution."
- Look for consistent, uninterrupted EPS growth
- Target: >10% annual growth = high growth
- Red flags: any year of negative EPS, erratic or declining trend
- A mountain-range EPS (ups and downs) disqualifies high-growth classification

## STEP 4 — 7 MOAT TYPES (Estebaranz Chapter 5)
Score competitive advantage by identifying which moats apply:
1. BRAND (Marca): Nike, Coca-Cola, McDonald's, Ferrari, Louis Vuitton
2. INTELLECTUAL PROPERTY (PI): Google, Tesla, pharma patents
3. LOW-COST ADVANTAGE (Costes bajos): Ryanair, Costco
4. REPUTATIONAL ADVANTAGE (Reputación): Moody's, Amazon marketplace
5. OLIGOPOLY (Oligopolio): airports (Aena), credit card networks (Visa/Mastercard), Boeing/Airbus
6. NETWORK EFFECT (Red): Facebook, Microsoft — more users = more value
7. SWITCHING COSTS (Costes de cambio): Adobe, Autodesk, Oracle, Constellation Software — changing is too costly
+ CULTURE (Cultura): Berkshire Hathaway, Neurones — management deeply aligned with shareholders

Estebaranz's moat test: "If we had €1 billion to compete against this company, could we? If no — strong moat."

## STEP 5 — SECTOR QUALITY (Estebaranz Chapter 8)
GOOD SECTORS (stable, allow durable competitive advantages):
Technology, healthcare, services, supermarkets, utilities (water/electricity/gas), waste management, maintenance, food & beverages, restaurants, defense

BAD SECTORS (cyclical, high competition, no durable advantage):
Mining, oil & gas, banking, insurance, transportation (airlines/maritime/trucking), construction, automotive, semiconductors, chemicals, discretionary consumer goods (furniture, appliances)

## STEP 6 — MANAGEMENT QUALITY (Estebaranz Chapters 5 & 8)
POSITIVE signals: Management owns significant shares (skin in the game), base salary moderate/symbolic, aggressive buybacks when stock is cheap, track record of good decisions
NEGATIVE signals: High CEO turnover, growth promises without results, systematic shareholder dilution, very high salaries uncorrelated with results

═══════════════════════════════════════════
SCORING RUBRIC (total: 100 pts)
═══════════════════════════════════════════

### CRITERION 1 — Crecimiento BPA / EPS Growth (0-20 pts)
20 pts: Consistent growth >15%/yr, no negative years, clean upward trend
16 pts: Consistent growth 10-15%/yr, very few interruptions
12 pts: Moderate growth 5-10%/yr, generally consistent
6 pts: Slow or erratic growth, some negative years
0-3 pts: Declining EPS, negative EPS, or completely erratic

### CRITERION 2 — Ventaja Competitiva / Competitive Moat (0-20 pts)
20 pts: Multiple strong moats (e.g., switching costs + network effect + brand)
15 pts: One very strong moat (e.g., true oligopoly, deep switching costs)
10 pts: One moderate moat or unclear advantage
5 pts: Weak or temporary advantage
0-3 pts: No identifiable moat, pure commodity

### CRITERION 3 — Calidad del Sector / Sector Quality (0-15 pts)
15 pts: Excellent sector (tech, healthcare, services — from Estebaranz's "good" list)
10 pts: Acceptable sector with some cyclicality
5 pts: Mixed or uncertain sector
0-2 pts: Bad sector per Estebaranz (mining, banking, airlines, auto, oil, construction)

### CRITERION 4 — Valoración PER / PER Valuation (0-20 pts)
Apply PER benchmarks RELATIVE to the stock type classified in Step 2:
For ESTABLE ALTO CRECIMIENTO (benchmark 20x-35x):
  - PER < 20 → 20 pts | PER 20-28 → 16 pts | PER 28-35 → 12 pts | PER 35-45 → 6 pts | PER > 45 → 2 pts
For ESTABLE BAJO CRECIMIENTO (benchmark 15x-25x):
  - PER < 15 → 20 pts | PER 15-20 → 16 pts | PER 20-25 → 12 pts | PER 25-30 → 6 pts | PER > 30 → 2 pts
For CÍCLICA ALTO CRECIMIENTO (benchmark 10x-15x):
  - PER < 10 → 20 pts | PER 10-15 → 14 pts | PER 15-20 → 8 pts | PER > 20 → 3 pts
For CÍCLICA BAJO CRECIMIENTO (benchmark 5x-10x):
  - PER < 8 → 18 pts | PER 8-12 → 10 pts | PER > 12 → 3 pts
If PER is negative (losses): 0 pts

### CRITERION 5 — Salud Financiera / Financial Health (0-15 pts)
15 pts: Debt/EBITDA < 1x, FCF strongly positive and growing, net margin > 20%
12 pts: Debt/EBITDA 1-2x, FCF positive, solid margin > 10%
8 pts: Moderate debt 2-3x, FCF positive, acceptable margin
4 pts: High debt 3-5x OR negative FCF OR thin margins
0-2 pts: Debt/EBITDA > 5x OR recurring losses

### CRITERION 6 — Calidad Directiva / Management Quality (0-10 pts)
10 pts: Strong insider ownership, consistent buybacks, moderate salaries, proven capital allocation
7 pts: Good signals overall but some uncertainty
4 pts: Mixed signals
0-2 pts: Red flags: dilution, high turnover, big salaries without results

═══════════════════════════════════════════
RECOMMENDATION THRESHOLDS
═══════════════════════════════════════════
75-100 → COMPRAR / BUY
50-74  → ESPERAR / WAIT
0-49   → EVITAR / AVOID

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════
Return ONLY a valid JSON object. NO markdown, NO backticks, NO text before or after the JSON:

{
  "puntuacion_total": <number 0-100, sum of all criteria scores>,
  "tipo_accion": "<ESTABLE_ALTO_CRECIMIENTO|ESTABLE_BAJO_CRECIMIENTO|CICLICA_ALTO_CRECIMIENTO|CICLICA_BAJO_CRECIMIENTO>",
  "criterios": [
    { "nombre_es": "Crecimiento BPA", "nombre_en": "EPS Growth", "puntuacion": <0-20>, "maximo": 20, "descripcion_es": "<2-3 sentences in Spanish>", "descripcion_en": "<2-3 sentences in English>" },
    { "nombre_es": "Ventaja Competitiva", "nombre_en": "Competitive Moat", "puntuacion": <0-20>, "maximo": 20, "descripcion_es": "<2-3 sentences>", "descripcion_en": "<2-3 sentences>" },
    { "nombre_es": "Calidad del Sector", "nombre_en": "Sector Quality", "puntuacion": <0-15>, "maximo": 15, "descripcion_es": "<2-3 sentences>", "descripcion_en": "<2-3 sentences>" },
    { "nombre_es": "Valoración PER", "nombre_en": "P/E Valuation", "puntuacion": <0-20>, "maximo": 20, "descripcion_es": "<2-3 sentences>", "descripcion_en": "<2-3 sentences>" },
    { "nombre_es": "Salud Financiera", "nombre_en": "Financial Health", "puntuacion": <0-15>, "maximo": 15, "descripcion_es": "<2-3 sentences>", "descripcion_en": "<2-3 sentences>" },
    { "nombre_es": "Calidad Directiva", "nombre_en": "Management Quality", "puntuacion": <0-10>, "maximo": 10, "descripcion_es": "<2-3 sentences>", "descripcion_en": "<2-3 sentences>" }
  ],
  "recomendacion": "<COMPRAR|ESPERAR|EVITAR>",
  "recomendacion_en": "<BUY|WAIT|AVOID>",
  "resumen_ejecutivo_es": "<2-3 sentence executive summary in Spanish>",
  "resumen_ejecutivo_en": "<2-3 sentence executive summary in English>",
  "justificacion_es": "<1-2 paragraph justification in Spanish>",
  "justificacion_en": "<1-2 paragraph justification in English>",
  "riesgos_es": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "riesgos_en": ["<risk 1>", "<risk 2>", "<risk 3>"]
}
`
}

// ─── JSON EXTRACTOR ─────────────────────────────────────────────────────────

function extractJSON(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}

// ─── HANDLER ────────────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ticker, language = 'es' } = req.body || {}

  if (!ticker) {
    return res.status(400).json({ error: 'Missing ticker' })
  }

  const symbol = ticker.toUpperCase().trim()

  try {
    // Step 1: fetch financial data from Yahoo Finance
    const financialData = await fetchYahooData(symbol)

    // Step 2: build prompt and call Claude
    const prompt = buildPrompt(financialData)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlocks = response.content.filter(b => b.type === 'text')
    const fullText = textBlocks.map(b => b.text).join('\n')
    const analysis = extractJSON(fullText)

    if (!analysis) {
      return res.status(500).json({ error: 'Failed to parse analysis JSON', raw: fullText.slice(0, 500) })
    }

    analysis.puntuacion_total = Math.max(0, Math.min(100, Math.round(analysis.puntuacion_total)))

    // Return both financialData and analysis
    return res.status(200).json({ financialData, analysis })

  } catch (err) {
    console.error('Analysis error:', err)
    if (err.message === 'INVALID_TICKER') {
      return res.status(404).json({ error: 'INVALID_TICKER' })
    }
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
