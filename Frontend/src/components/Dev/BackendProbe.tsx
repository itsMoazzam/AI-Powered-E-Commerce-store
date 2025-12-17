import React, { useEffect, useState } from 'react'

function timeoutFetch(url: string, ms = 2000) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), ms)
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id))
}

export default function BackendProbe() {
    const [reachable, setReachable] = useState<boolean | null>(null)
    const [checking, setChecking] = useState(false)
    const [hidden, setHidden] = useState<boolean>(() => Boolean(localStorage.getItem('hide_backend_probe')))

    const check = async () => {
        setChecking(true)
        try {
            // Try common health endpoints and a lightweight products request
            const tries = ['/api/products/?page_size=1']
            let ok = false
            for (const u of tries) {
                try {
                    const res = await timeoutFetch(u, 1800)
                    if (res && res.ok) { ok = true; break }
                } catch (e) {
                    // ignore and try next
                }
            }
            setReachable(ok)
            if (!ok && import.meta.env.DEV) {
                // helpful developer hint
                console.warn('Backend appears unreachable. Check that your backend is running, or set VITE_API_BASE_URL in .env, or configure the Vite proxy in vite.config.ts')
            }
        } finally {
            setChecking(false)
        }
    }

    useEffect(() => {
        if (hidden) return
        check()
        // also recheck when window gains focus (useful when backend restarted)
        const onFocus = () => { check() }
        window.addEventListener('focus', onFocus)
        return () => window.removeEventListener('focus', onFocus)
    }, [hidden])

    if (hidden || import.meta.env.PROD) return null

    if (reachable === null) return null

    if (reachable) return null

    return (
        <div className="w-full bg-yellow-50 border-t border-yellow-200 text-yellow-900 px-4 py-3 text-sm flex items-center justify-between gap-4">
            <div>
                <strong className="font-medium">Backend unreachable</strong>
                <div className="text-xs text-muted mt-1">Vite reported proxy errors (ECONNREFUSED). Ensure the backend is running, or set <code>VITE_API_BASE_URL</code> / fix proxy in <code>vite.config.ts</code>.</div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={check} className="px-3 py-1 rounded bg-yellow-600 text-white text-xs">Retry</button>
                <button onClick={() => { localStorage.setItem('hide_backend_probe', '1'); setHidden(true) }} className="px-3 py-1 rounded border text-xs">Dismiss</button>
            </div>
        </div>
    )
}
