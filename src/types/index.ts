export interface EPSPoint {
  year: number
  value: number
}

export interface FinancialData {
  ticker: string
  companyName: string
  sector: string
  currentPrice: number
  per: number
  eps: EPSPoint[]
  roe: number
  debtToEbitda: number
  freeCashFlow: number
  netMargin: number
}

export interface Criterion {
  nombre_es: string
  nombre_en: string
  puntuacion: number
  maximo: number
  descripcion_es: string
  descripcion_en: string
}

export type StockType =
  | 'ESTABLE_ALTO_CRECIMIENTO'
  | 'ESTABLE_BAJO_CRECIMIENTO'
  | 'CICLICA_ALTO_CRECIMIENTO'
  | 'CICLICA_BAJO_CRECIMIENTO'

export interface Analysis {
  puntuacion_total: number
  tipo_accion?: StockType
  criterios: Criterion[]
  recomendacion: 'COMPRAR' | 'ESPERAR' | 'EVITAR'
  recomendacion_en: 'BUY' | 'WAIT' | 'AVOID'
  justificacion_es: string
  justificacion_en: string
  resumen_ejecutivo_es: string
  resumen_ejecutivo_en: string
  riesgos_es: string[]
  riesgos_en: string[]
}

export type AppState = 'home' | 'loading' | 'results' | 'error'

export type RecommendationType = 'BUY' | 'WAIT' | 'AVOID'
