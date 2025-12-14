import { useState, useRef } from 'react'
import api from '../lib/api'

export default function HelpPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const scrollBottom = () => {
    try { containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' }) } catch (e) { }
  }

  const send = async () => {
    if (!input.trim()) return
    const text = input.trim()
    const userMsg = { role: 'user' as const, text }
    setMessages((s) => [...s, userMsg])
    setInput('')
    setLoading(true)
    scrollBottom()

    try {
      // Try backend AI endpoint first
      const { data } = await api.post('/api/ai-chat/', { message: text })
      const reply = data?.reply ?? data?.answer ?? data?.message ?? null
      if (reply) {
        setMessages((s) => [...s, { role: 'assistant', text: String(reply) }])
      } else {
        // Fallback canned reply
        setMessages((s) => [...s, { role: 'assistant', text: 'Sorry, I could not get an answer. Please try again later.' }])
      }
    } catch (err) {
      // If backend missing, provide a local mock response
      console.warn('AI chat request failed, using local fallback', err)
      setMessages((s) => [...s, {
        role: 'assistant', text: "Hi — I'm a local demo assistant. I can't access remote AI from here. Ask me about ordering, products, or use the " +
          "Help & Support documentation."
      }])
    } finally {
      setLoading(false)
      scrollBottom()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Help & AI Assistant</h1>
      <p className="text-sm text-muted mb-4">Ask product questions, order help, or general support. This UI will POST to <code>/api/ai-chat/</code> — implement your backend to connect to an AI provider, or let the demo fallback reply.</p>

      <div ref={containerRef} className="h-[60vh] overflow-auto bg-white border rounded p-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted mt-8">Hi — ask me anything about products or your orders.</div>
        ) : (
          messages.map((m, i) => (
            <div key={`msg-${i}`} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-default'} rounded-lg px-4 py-2 max-w-[80%]`}>{m.text}</div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send() }} placeholder="Type your question..." className="flex-1 border rounded px-3 py-2" />
        <button onClick={send} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Thinking…' : 'Send'}</button>
      </div>
    </div>
  )
}
