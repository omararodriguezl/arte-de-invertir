import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FinancialData, Analysis, StockType } from '../types'

type Lang = 'es' | 'en'

function fmt(n: number, decimals = 2) {
  return n.toFixed(decimals)
}

function recColor(rec: string): [number, number, number] {
  if (rec === 'COMPRAR' || rec === 'BUY') return [34, 197, 94]
  if (rec === 'ESPERAR' || rec === 'WAIT') return [245, 158, 11]
  return [239, 68, 68]
}

const STOCK_TYPE_LABELS: Record<StockType, { es: string; en: string; perRange: string }> = {
  ESTABLE_ALTO_CRECIMIENTO: { es: 'Estable + Alto Crecimiento', en: 'Stable + High Growth', perRange: '20x–35x' },
  ESTABLE_BAJO_CRECIMIENTO: { es: 'Estable + Bajo Crecimiento', en: 'Stable + Low Growth', perRange: '15x–25x' },
  CICLICA_ALTO_CRECIMIENTO: { es: 'Cíclica + Alto Crecimiento', en: 'Cyclical + High Growth', perRange: '10x–15x' },
  CICLICA_BAJO_CRECIMIENTO: { es: 'Cíclica + Bajo Crecimiento', en: 'Cyclical + Low Growth', perRange: '5x–10x' },
}

export async function generatePDF(
  financialData: FinancialData,
  analysis: Analysis,
  lang: Lang
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const MARGIN = 16
  const CONTENT_W = W - MARGIN * 2

  const isEs = lang === 'es'
  const today = new Date().toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // Colors
  const DARK: [number, number, number] = [7, 10, 14]
  const GOLD: [number, number, number] = [201, 168, 76]
  const MUTED: [number, number, number] = [122, 133, 153]
  const LIGHT: [number, number, number] = [240, 235, 224]
  const SURFACE: [number, number, number] = [22, 28, 40]

  const rec = isEs ? analysis.recomendacion : analysis.recomendacion_en
  const recRGB = recColor(rec)

  // ─── PAGE 1: VISUAL REPORT ───────────────────────────────────────────────

  // Header bar
  doc.setFillColor(...DARK)
  doc.rect(0, 0, W, 297, 'F')

  doc.setFillColor(14, 20, 32)
  doc.rect(0, 0, W, 40, 'F')

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...GOLD)
  const appTitle = isEs ? 'El Arte de Invertir' : 'The Art of Investing'
  doc.text(appTitle, MARGIN, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text(isEs ? 'Metodología: El Arte de Invertir · Alejandro Estebaranz' : 'Methodology: El Arte de Invertir · Alejandro Estebaranz', MARGIN, 23)
  doc.text(`${isEs ? 'Fecha' : 'Date'}: ${today}`, W - MARGIN, 23, { align: 'right' })

  // Company hero section
  let y = 50

  doc.setFillColor(...SURFACE)
  doc.roundedRect(MARGIN, y, CONTENT_W, 44, 4, 4, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...LIGHT)
  doc.text(`${financialData.companyName} (${financialData.ticker})`, MARGIN + 8, y + 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(financialData.sector, MARGIN + 8, y + 21)

  // Stock type badge
  if (analysis.tipo_accion) {
    const typeInfo = STOCK_TYPE_LABELS[analysis.tipo_accion]
    const typeLabel = isEs ? typeInfo.es : typeInfo.en
    const isEstable = analysis.tipo_accion.startsWith('ESTABLE')
    const typeColor: [number, number, number] = isEstable ? [34, 197, 94] : [245, 158, 11]
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...typeColor)
    doc.text(`◆ ${typeLabel}  |  PER ref: ${typeInfo.perRange}`, MARGIN + 8, y + 28)
  }

  // Key metrics in hero
  const metrics = [
    { label: isEs ? 'Precio' : 'Price', value: `$${fmt(financialData.currentPrice)}` },
    { label: 'PER / P/E', value: fmt(financialData.per, 1) },
    { label: 'ROE', value: `${fmt(financialData.roe, 1)}%` },
    { label: isEs ? 'Margen Neto' : 'Net Margin', value: `${fmt(financialData.netMargin, 1)}%` },
  ]
  const metricW = CONTENT_W / metrics.length
  metrics.forEach((m, i) => {
    const mx = MARGIN + i * metricW + metricW / 2
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...GOLD)
    doc.text(m.value, mx, y + 37, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text(m.label, mx, y + 42, { align: 'center' })
  })

  y += 54

  // Recommendation + Score side by side
  const halfW = (CONTENT_W - 8) / 2

  // Recommendation box
  doc.setFillColor(...SURFACE)
  doc.roundedRect(MARGIN, y, halfW, 38, 4, 4, 'F')
  doc.setDrawColor(...recRGB)
  doc.setLineWidth(0.8)
  doc.roundedRect(MARGIN, y, halfW, 38, 4, 4, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text(isEs ? 'RECOMENDACIÓN' : 'RECOMMENDATION', MARGIN + halfW / 2, y + 11, { align: 'center' })

  doc.setFontSize(22)
  doc.setTextColor(...recRGB)
  doc.text(rec, MARGIN + halfW / 2, y + 26, { align: 'center' })

  // Score box
  const sx = MARGIN + halfW + 8
  doc.setFillColor(...SURFACE)
  doc.roundedRect(sx, y, halfW, 38, 4, 4, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text(isEs ? 'PUNTUACIÓN TOTAL' : 'TOTAL SCORE', sx + halfW / 2, y + 11, { align: 'center' })

  const scoreColor: [number, number, number] =
    analysis.puntuacion_total >= 75 ? [34, 197, 94] :
    analysis.puntuacion_total >= 50 ? [245, 158, 11] : [239, 68, 68]

  doc.setFontSize(26)
  doc.setTextColor(...scoreColor)
  doc.text(`${analysis.puntuacion_total}`, sx + halfW / 2 - 4, y + 27, { align: 'center' })
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text('/100', sx + halfW / 2 + 8, y + 27)

  y += 48

  // Criteria section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...GOLD)
  doc.text(isEs ? 'LOS 6 CRITERIOS DE ESTEBARANZ' : 'ESTEBARANZ\'S 6 CRITERIA', MARGIN, y + 6)
  y += 14

  analysis.criterios.forEach((c, i) => {
    const name = isEs ? c.nombre_es : c.nombre_en
    const pct = c.puntuacion / c.maximo
    const barColor: [number, number, number] = pct >= 0.75 ? [34, 197, 94] : pct >= 0.5 ? [245, 158, 11] : [239, 68, 68]
    const row = i % 2 === 0

    const cx = row ? MARGIN : MARGIN + halfW + 8
    const colW = halfW

    doc.setFillColor(16, 22, 34)
    doc.roundedRect(cx, y, colW, 18, 3, 3, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...LIGHT)
    doc.text(name, cx + 5, y + 7)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...barColor)
    doc.text(`${c.puntuacion}/${c.maximo}`, cx + colW - 5, y + 7, { align: 'right' })

    // Progress bar track
    const barX = cx + 5
    const barW = colW - 10
    doc.setFillColor(30, 42, 58)
    doc.roundedRect(barX, y + 10, barW, 3, 1, 1, 'F')
    doc.setFillColor(...barColor)
    doc.roundedRect(barX, y + 10, barW * pct, 3, 1, 1, 'F')

    if (!row || i === analysis.criterios.length - 1) y += 22
  })

  // EPS Chart
  y += 6
  if (financialData.eps.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...GOLD)
    doc.text(isEs ? 'HISTORIAL BPA (EPS)' : 'EPS HISTORY', MARGIN, y + 6)
    y += 14

    const chartH = 30
    const barW2 = CONTENT_W / financialData.eps.length - 4
    const maxVal = Math.max(...financialData.eps.map(e => Math.abs(e.value)), 0.01)

    financialData.eps.forEach((point, i) => {
      const isPos = point.value >= 0
      const bh = (Math.abs(point.value) / maxVal) * chartH * 0.9
      const bx = MARGIN + i * (barW2 + 4)
      const col: [number, number, number] = isPos ? [34, 197, 94] : [239, 68, 68]

      doc.setFillColor(...col)
      if (isPos) {
        doc.rect(bx, y + chartH - bh, barW2, bh, 'F')
      } else {
        doc.rect(bx, y + chartH, barW2, bh, 'F')
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(...col)
      doc.text(`$${point.value.toFixed(1)}`, bx + barW2 / 2, y + chartH - bh - 2, { align: 'center' })

      doc.setTextColor(...MUTED)
      doc.text(`${point.year}`, bx + barW2 / 2, y + chartH + 7, { align: 'center' })
    })

    y += chartH + 14
  }

  // Footer p1
  doc.setFillColor(14, 20, 32)
  doc.rect(0, 277, W, 20, 'F')
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6.5)
  doc.setTextColor(...MUTED)
  const disclaimer = isEs
    ? 'Este análisis es solo informativo y no constituye asesoramiento financiero.'
    : 'This analysis is for informational purposes only and does not constitute financial advice.'
  doc.text(disclaimer, W / 2, 285, { align: 'center', maxWidth: CONTENT_W })
  doc.text(`${isEs ? 'Página' : 'Page'} 1`, W - MARGIN, 285, { align: 'right' })

  // ─── PAGE 2: WRITTEN REPORT ──────────────────────────────────────────────

  doc.addPage()
  doc.setFillColor(...DARK)
  doc.rect(0, 0, W, 297, 'F')

  // Header p2
  doc.setFillColor(14, 20, 32)
  doc.rect(0, 0, W, 30, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...GOLD)
  doc.text(isEs ? 'Reporte Escrito' : 'Written Report', MARGIN, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(`${financialData.companyName} (${financialData.ticker}) — ${today}`, MARGIN, 22)

  y = 40

  // Executive summary
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...GOLD)
  doc.text(isEs ? 'RESUMEN EJECUTIVO' : 'EXECUTIVE SUMMARY', MARGIN, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(200, 195, 185)
  const summary = isEs ? analysis.resumen_ejecutivo_es : analysis.resumen_ejecutivo_en
  const summaryLines = doc.splitTextToSize(summary, CONTENT_W)
  doc.text(summaryLines, MARGIN, y)
  y += summaryLines.length * 4.5 + 10

  // Criteria analysis
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...GOLD)
  doc.text(isEs ? 'ANÁLISIS POR CRITERIO' : 'CRITERIA ANALYSIS', MARGIN, y)
  y += 8

  analysis.criterios.forEach(c => {
    if (y > 250) { doc.addPage(); y = 20 }

    const name = isEs ? c.nombre_es : c.nombre_en
    const desc = isEs ? c.descripcion_es : c.descripcion_en
    const pct = c.puntuacion / c.maximo
    const col: [number, number, number] = pct >= 0.75 ? [34, 197, 94] : pct >= 0.5 ? [245, 158, 11] : [239, 68, 68]

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...LIGHT)
    doc.text(`${name}`, MARGIN, y)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...col)
    doc.text(`${c.puntuacion}/${c.maximo}`, W - MARGIN, y, { align: 'right' })
    y += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    const descLines = doc.splitTextToSize(desc, CONTENT_W)
    doc.text(descLines, MARGIN, y)
    y += descLines.length * 4 + 7
  })

  // Risks
  if (y > 230) { doc.addPage(); y = 20 }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...GOLD)
  doc.text(isEs ? 'RIESGOS PRINCIPALES' : 'MAIN RISKS', MARGIN, y)
  y += 7

  const risks = isEs ? analysis.riesgos_es : analysis.riesgos_en
  risks.forEach(risk => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(200, 195, 185)
    const rLines = doc.splitTextToSize(`• ${risk}`, CONTENT_W)
    doc.text(rLines, MARGIN, y)
    y += rLines.length * 4 + 4
  })

  y += 6

  // Justification
  if (y > 230) { doc.addPage(); y = 20 }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...GOLD)
  doc.text(isEs ? 'JUSTIFICACIÓN' : 'JUSTIFICATION', MARGIN, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(200, 195, 185)
  const just = isEs ? analysis.justificacion_es : analysis.justificacion_en
  const justLines = doc.splitTextToSize(just, CONTENT_W)
  doc.text(justLines, MARGIN, y)
  y += justLines.length * 4.5

  // Disclaimer footer
  doc.setFillColor(14, 20, 32)
  doc.rect(0, 277, W, 20, 'F')
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6)
  doc.setTextColor(...MUTED)
  const dis2 = 'Este análisis es solo informativo y no constituye asesoramiento financiero. / This analysis is for informational purposes only and does not constitute financial advice.'
  doc.text(dis2, W / 2, 284, { align: 'center', maxWidth: CONTENT_W })
  doc.text(`${isEs ? 'Página' : 'Page'} 2`, W - MARGIN, 290, { align: 'right' })

  // Save
  const filename = `${financialData.ticker}_${isEs ? 'analisis' : 'analysis'}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
