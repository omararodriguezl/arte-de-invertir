import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FinancialData, Analysis } from '../types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  open: boolean
  onClose: () => void
  financialData: FinancialData
  analysis: Analysis
}

export default function ChatPanel({ open, onClose, financialData, analysis }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'en' ? 'en' : 'es'
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 400)
    } else {
      setMessages([])
      setInput('')
    }
  }, [open])

  // Lock body scroll when panel open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          financialData,
          analysis,
        }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: lang === 'es'
          ? 'Error al conectar con la IA. Intenta de nuevo.'
          : 'Error connecting to AI. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const welcome = lang === 'es'
    ? `Hola, soy tu asistente de inversión basado en "El Arte de Invertir" de Alejandro Estebaranz. Puedo responder tus preguntas sobre **${financialData.companyName}** usando el framework del libro. ¿Qué quieres saber?`
    : `Hi, I'm your investment assistant based on "El Arte de Invertir" by Alejandro Estebaranz. I can answer your questions about **${financialData.companyName}** using the book's framework. What would you like to know?`

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
        style={{
          height: '85dvh',
          maxHeight: '85dvh',
          borderRadius: '20px 20px 0 0',
          background: '#0E1420',
          border: '1px solid #1E2A3A',
          borderBottom: 'none',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Handle + Header */}
        <div className="flex-shrink-0 px-4 pt-3 pb-3" style={{ borderBottom: '1px solid #1E2A3A' }}>
          {/* Drag handle */}
          <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: '#2A3A52' }} />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-[#C9A84C]">
                {lang === 'es' ? 'Consulta IA' : 'AI Consultation'}
              </h3>
              <p className="text-[10px] text-[#7A8599] font-body mt-0.5">
                {lang === 'es'
                  ? `Basado en "El Arte de Invertir" · ${financialData.ticker}`
                  : `Based on "El Arte de Invertir" · ${financialData.ticker}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: '#1E2A3A', color: '#7A8599' }}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ overscrollBehavior: 'contain' }}>
          {/* Welcome message */}
          <AssistantBubble text={welcome} />

          {/* Suggested questions */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {(lang === 'es' ? SUGGESTED_ES : SUGGESTED_EN).map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); inputRef.current?.focus() }}
                  className="text-xs font-body px-3 py-2 rounded-xl transition-all duration-200 text-left"
                  style={{
                    background: 'rgba(201,168,76,0.06)',
                    color: '#C9A84C',
                    border: '1px solid rgba(201,168,76,0.2)',
                    lineHeight: 1.4,
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) =>
            msg.role === 'user'
              ? <UserBubble key={i} text={msg.content} />
              : <AssistantBubble key={i} text={msg.content} />
          )}

          {loading && (
            <div className="flex items-center gap-2 px-1">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: '#C9A84C',
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-[#7A8599] font-body">
                {lang === 'es' ? 'Analizando...' : 'Analyzing...'}
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="flex-shrink-0 px-4 py-3 flex gap-2 items-end"
          style={{
            borderTop: '1px solid #1E2A3A',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKey}
            placeholder={lang === 'es' ? 'Pregunta sobre el análisis...' : 'Ask about the analysis...'}
            rows={1}
            className="flex-1 resize-none font-body text-sm rounded-xl px-4 py-3 outline-none transition-all"
            style={{
              background: '#0B1118',
              border: '1px solid #1E2A3A',
              color: '#F0EBE0',
              minHeight: '46px',
              maxHeight: '120px',
              lineHeight: '1.5',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(201,168,76,0.4)' }}
            onBlur={e => { e.target.style.borderColor = '#1E2A3A' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A8873A)' }}
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 2L2 7l5 1.5L8.5 14 14 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm font-body text-sm leading-relaxed"
        style={{ background: 'rgba(201,168,76,0.12)', color: '#F0EBE0', border: '1px solid rgba(201,168,76,0.2)' }}
      >
        {text}
      </div>
    </div>
  )
}

function AssistantBubble({ text }: { text: string }) {
  // Render **bold** markdown
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return (
    <div className="flex justify-start">
      <div className="flex gap-2 items-start max-w-[92%]">
        <div
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
          style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 7L4 4l2 2 2-4" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-sm font-body text-sm leading-relaxed"
          style={{ background: '#141E2D', color: '#B0A898', border: '1px solid #1E2A3A' }}
        >
          {parts.map((p, i) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={i} style={{ color: '#F0EBE0', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
              : <span key={i}>{p}</span>
          )}
        </div>
      </div>
    </div>
  )
}

const SUGGESTED_ES = [
  '¿Por qué esta puntuación?',
  '¿Qué tipo de moat tiene?',
  '¿Está cara o barata según el PER?',
  '¿Qué diría Estebaranz de esta empresa?',
]

const SUGGESTED_EN = [
  'Why this score?',
  'What type of moat does it have?',
  'Is it cheap or expensive by P/E?',
  'What would Estebaranz say?',
]
