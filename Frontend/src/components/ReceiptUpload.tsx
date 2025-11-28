import { useState } from 'react'

export default function ReceiptUpload({ orderId, onVerified }: { orderId?: string | number, onVerified?: (ok: boolean, info?: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function loadTesseract(): Promise<any> {
    // load from CDN if not present
    if ((window as any).Tesseract) return (window as any).Tesseract
    return new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://unpkg.com/tesseract.js@2.1.5/dist/tesseract.min.js'
      s.onload = () => resolve((window as any).Tesseract)
      s.onerror = reject
      document.head.appendChild(s)
    })
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setLoading(true)
    setResult(null)
    try {
      const Tesseract = await loadTesseract()
      const img = URL.createObjectURL(f)
      const res = await Tesseract.recognize(img, 'eng')
      const text: string = res.data?.text || ''
      setResult(text)

      // simple email extraction
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      const amountMatch = text.match(/\$?\s*(\d+[.,]?\d{0,2})/)

      const info = { email: emailMatch?.[0] || null, amount: amountMatch?.[1] || null, text }

      // call backend verification endpoint if available
      try {
        await fetch(`/api/payments/verify-receipt/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId, ...info }),
        })
      } catch (err) {
        console.warn('Receipt verification endpoint failed or not present', err)
      }

      onVerified && onVerified(true, info)
    } catch (err) {
      console.error('OCR failed', err)
      onVerified && onVerified(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Upload Receipt (for offline payments)</label>
      <input type="file" accept="image/*,application/pdf" onChange={handleFile} />
      {loading && <div className="text-sm text-muted">Processing receipt…</div>}
      {result && <details className="text-xs text-muted"><summary className="cursor-pointer">OCR Result (click to view)</summary><pre className="whitespace-pre-wrap text-xs">{result}</pre></details>}
    </div>
  )
}
