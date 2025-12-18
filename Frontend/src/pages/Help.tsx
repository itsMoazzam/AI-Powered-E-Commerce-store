import { useState, useRef, useEffect } from 'react'
import api from '../lib/api'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  created?: string
}

interface ChatSession {
  id: number
  title: string
  created: string
  updated: string
  is_active: boolean
  message_count?: number
  messages?: Message[]
}

interface FAQItem {
  id: number
  question: string
  answer: string
  category: string
  keywords: string[]
}

interface APIMetadata {
  model?: string
  api?: string
  finish_reason?: string
}

export default function HelpPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [showSessions, setShowSessions] = useState(false)
  const [faqResults, setFaqResults] = useState<FAQItem[]>([])
  const [showFAQ, setShowFAQ] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [metadata, setMetadata] = useState<APIMetadata | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Scroll to bottom when messages update
  const scrollBottom = () => {
    setTimeout(() => {
      try { containerRef.current?.scrollTo({ top: containerRef.current?.scrollHeight, behavior: 'smooth' }) } catch (e) { }
    }, 100)
  }

  // Load chat sessions on mount
  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    scrollBottom()
  }, [messages])

  // Load user's chat sessions
  const loadSessions = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setSessionsLoading(true)
    try {
      const { data } = await api.get('/api/chat/sessions/')
      setSessions(data.results || data || [])
      setError(null)
    } catch (err: any) {
      console.error('Failed to load sessions:', err)
      setError('Failed to load chat history')
    } finally {
      setSessionsLoading(false)
    }
  }

  // Load chat history for a session
  const loadSessionHistory = async (id: number) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const { data } = await api.get(`/api/chat/sessions/${id}/history/`)
      setSessionId(id)
      setMessages(data.messages || [])
      setShowSessions(false)
      setError(null)
    } catch (err: any) {
      console.error('Failed to load session history:', err)
      setError(`Failed to load chat history: ${err.response?.data?.detail || 'Unknown error'}`)
    }
  }

  // Create new chat session
  const createNewSession = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Please log in to create a new chat')
      return
    }

    try {
      const { data } = await api.post('/api/chat/sessions/', {
        title: `Chat ${new Date().toLocaleString()}`
      })
      setSessionId(data.id)
      setMessages([])
      setError(null)
      await loadSessions()
    } catch (err: any) {
      console.error('Failed to create session:', err)
      setError(`Failed to create chat: ${err.response?.data?.detail || 'Unknown error'}`)
    }
  }

  // Send message and get AI response
  const sendMessage = async () => {
    if (!input.trim()) return

    const text = input.trim()
    const token = localStorage.getItem('token')
    
    if (!token) {
      setError('Please log in to use the AI chat assistant.')
      return
    }

    setInput('')
    setLoading(true)
    setError(null)

    try {
      // If no session exists, create one
      let currentSessionId = sessionId
      if (!currentSessionId) {
        const sessionResponse = await api.post('/api/chat/sessions/', {
          title: `Chat ${new Date().toLocaleString()}`
        })
        currentSessionId = sessionResponse.data.id
        setSessionId(currentSessionId)
        await loadSessions()
      }

      // Send message to API
      const response = await api.post('/api/chat/send/', {
        message: text,
        session_id: currentSessionId
      })

      const data = response.data

      // Store metadata for debugging/info
      if (data.metadata) {
        setMetadata(data.metadata)
      }

      // Add both user and assistant messages
      if (data.user_message) {
        setMessages((s) => [...s, {
          id: data.user_message.id,
          role: 'user',
          content: data.user_message.content,
          created: data.user_message.created
        }])
      }

      if (data.assistant_message) {
        setMessages((s) => [...s, {
          id: data.assistant_message.id,
          role: 'assistant',
          content: data.assistant_message.content,
          created: data.assistant_message.created
        }])
      } else {
        setError('No response from AI. Please try again.')
      }
    } catch (err: any) {
      console.error('Failed to send message:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to send message. Please try again.'
      setError(errorMsg)
      setMessages((s) => [...s, {
        id: Date.now(),
        role: 'assistant',
        content: `Error: ${errorMsg}`,
        created: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  // Search FAQ
  const searchFAQ = async (query: string) => {
    if (!query.trim()) {
      setFaqResults([])
      return
    }

    try {
      const { data } = await api.get(`/api/chat/faq/search/?q=${encodeURIComponent(query)}`)
      setFaqResults(data.results || data || [])
      setError(null)
    } catch (err: any) {
      console.error('Failed to search FAQ:', err)
      setError('Failed to search FAQ')
    }
  }

  // Load all FAQ items
  const loadFAQ = async () => {
    try {
      const { data } = await api.get('/api/chat/faq/')
      // Handle both array and object responses
      setFaqResults(Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : []))
      setShowFAQ(true)
      setError(null)
    } catch (err: any) {
      console.error('Failed to load FAQ:', err)
      setError('Failed to load FAQ')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Help & AI Assistant</h1>
      <p className="text-muted mb-6">Get instant support with our AI-powered chat assistant powered by Google's Gemini AI.</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-4 sticky top-20">
            <button
              onClick={createNewSession}
              className="w-full mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
            >
              + New Chat
            </button>

            {/* Sessions List */}
            <div className="mb-6">
              <button
                onClick={() => setShowSessions(!showSessions)}
                className="w-full text-left font-semibold text-sm mb-2 flex items-center gap-2"
              >
                <span>Chat History</span>
                <span className="text-xs text-muted">({sessions.length})</span>
              </button>

              {showSessions && (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {sessionsLoading ? (
                    <p className="text-xs text-muted animate-pulse">Loading...</p>
                  ) : sessions.length === 0 ? (
                    <p className="text-xs text-muted">No chat history</p>
                  ) : (
                    sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => loadSessionHistory(session.id)}
                        className={`w-full text-left p-2 rounded text-sm truncate ${
                          sessionId === session.id
                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                            : 'hover:bg-gray-100'
                        }`}
                        title={session.title}
                      >
                        {session.title}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* FAQ Section */}
            <div className="border-t pt-4">
              <button
                onClick={loadFAQ}
                className="w-full text-left font-semibold text-sm mb-2"
              >
                Browse FAQ
              </button>

              {showFAQ && (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  <input
                    type="text"
                    placeholder="Search FAQ..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      searchFAQ(e.target.value)
                    }}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />

                  {faqResults.length === 0 ? (
                    <p className="text-xs text-muted">No FAQ items found</p>
                  ) : (
                    faqResults.map((faq) => (
                      <div
                        key={faq.id}
                        className="p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100 border-l-2 border-indigo-300"
                        onClick={() => setInput(faq.question)}
                      >
                        <p className="font-medium text-gray-900 mb-1">{faq.question}</p>
                        <p className="text-gray-600 line-clamp-2">{faq.answer}</p>
                        <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          {faq.category}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <div className="bg-white border rounded-lg flex flex-col h-[70vh]">
            {/* Messages Container */}
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="text-muted">
                    <p className="text-lg font-medium mb-2">Welcome to AI Chat Support</p>
                    <p className="text-sm">Ask me anything about products, orders, shipping, or returns.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.created && (
                        <p className={`text-xs mt-1 ${
                          msg.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                        }`}>
                          {new Date(msg.created).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                    <p className="text-sm animate-pulse">AI is thinking...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="border-t border-red-200 bg-red-50 p-3">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t p-4">
              {!localStorage.getItem('token') && (
                <p className="text-sm text-amber-600 mb-2 bg-amber-50 p-2 rounded">
                  Please log in to use the chat feature.
                </p>
              )}
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !loading) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Type your question... (Shift+Enter for new line)"
                  disabled={loading || !localStorage.getItem('token')}
                  className="flex-1 border rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !localStorage.getItem('token')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {loading ? 'Sending…' : 'Send'}
                </button>
              </div>
            </div>

            {/* Metadata Footer */}
            {metadata && (
              <div className="border-t bg-gray-50 p-2 text-xs text-gray-600 space-y-1">
                <p><strong>Model:</strong> {metadata.model || 'N/A'}</p>
                <p><strong>API:</strong> {metadata.api || 'N/A'}</p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p className="font-medium mb-1">ℹ️ Powered by Google Gemini AI</p>
            <p>Responses are generated in real-time. For faster replies, we maintain conversation history and FAQ knowledge.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
