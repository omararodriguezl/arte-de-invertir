# El Arte de Invertir / The Art of Investing

Aplicación de análisis de inversiones basada en la metodología de valor del libro **"El Arte de Invertir"** de Alejandro Estebaranz.

Value investing analysis app based on the methodology from the book **"El Arte de Invertir"** by Alejandro Estebaranz.

---

## ¿Qué hace? / What does it do?

Ingresa un ticker de bolsa (ej. `AAPL`, `MSFT`, `NVDA`) y la app:

1. Obtiene datos financieros reales desde la API de Financial Modeling Prep (FMP)
2. Claude AI busca información actualizada en la web sobre la empresa
3. Evalúa 6 criterios del libro con puntuación de 0-100
4. Recomienda: **COMPRAR / ESPERAR / EVITAR**
5. Genera un reporte PDF descargable de 2 páginas

Enter a stock ticker (e.g. `AAPL`, `MSFT`, `NVDA`) and the app:

1. Fetches real financial data from the Financial Modeling Prep (FMP) API
2. Claude AI searches the web for updated company information
3. Scores 6 criteria from the book on a 0-100 scale
4. Recommends: **BUY / WAIT / AVOID**
5. Generates a downloadable 2-page PDF report

---

## Variables de entorno / Environment Variables

Crea un archivo `.env` en la raíz del proyecto (basado en `.env.example`):

```bash
# API de Financial Modeling Prep (gratuita)
VITE_FMP_API_KEY=tu_clave_aqui

# API de Anthropic (solo servidor — sin VITE_ prefix)
ANTHROPIC_API_KEY=tu_clave_aqui
```

### Cómo obtener las claves / How to get the API keys

**FMP API Key (gratis):**
1. Ve a [financialmodelingprep.com/developer/docs](https://financialmodelingprep.com/developer/docs)
2. Regístrate gratis
3. Copia tu API key del dashboard

**Anthropic API Key:**
1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. Crea una cuenta y genera una API key
3. Agrega créditos (el análisis usa ~$0.01-0.05 por consulta)

---

## Instalación local / Local Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env
# Edita .env y agrega tus claves

# 3. Correr en desarrollo
npm run dev
# Abre http://localhost:3000

# 4. Build para producción
npm run build
```

---

## Deploy en Vercel / Deploy to Vercel

### Método 1 — Vercel Dashboard (recomendado)

1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com) → **New Project**
3. Importa tu repositorio
4. En **Environment Variables** agrega:
   - `VITE_FMP_API_KEY` = tu clave FMP
   - `ANTHROPIC_API_KEY` = tu clave Anthropic
5. Click **Deploy** ✓

### Método 2 — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
# Sigue las instrucciones y agrega las variables de entorno cuando se pida
```

> **Importante:** `ANTHROPIC_API_KEY` NO debe tener el prefijo `VITE_` — es una variable de servidor que se usa en la función serverless `/api/analyze.js` y nunca se expone al navegador.

---

## Uso desde móvil / Mobile Usage

- La app es mobile-first: funciona perfectamente en cualquier navegador móvil
- El botón "Descargar PDF" funciona en iOS Safari y Android Chrome
- iOS: el PDF se abre en el visor de Safari, usa el botón de compartir para guardarlo
- Android: el PDF se descarga directamente a la carpeta de Descargas

---

## Stack técnico / Tech Stack

- **React 18 + Vite** — Frontend
- **Tailwind CSS** — Estilos (dark luxury theme)
- **react-i18next** — Español / English
- **Financial Modeling Prep API** — Datos financieros en tiempo real
- **Anthropic API (Claude)** — Análisis IA con búsqueda web
- **jsPDF + html2canvas** — Generación de PDF
- **Vercel** — Hosting + Serverless Functions

---

## Criterios de análisis / Analysis Criteria

| Criterio | Puntos |
|----------|--------|
| Crecimiento BPA (EPS Growth) | 0-20 |
| Ventaja Competitiva (Moat) | 0-20 |
| Calidad del Sector | 0-15 |
| Valoración PER | 0-20 |
| Salud Financiera | 0-15 |
| Calidad Directiva | 0-10 |
| **Total** | **0-100** |

- **75-100** → COMPRAR / BUY 🟢
- **50-74** → ESPERAR / WAIT 🟡
- **0-49** → EVITAR / AVOID 🔴

---

## Descargo de responsabilidad / Disclaimer

Este análisis es solo informativo y no constituye asesoramiento financiero.
This analysis is for informational purposes only and does not constitute financial advice.
