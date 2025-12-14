
// FILE: src/pages/seller/utils/export.ts
export function exportToCSV(filename: string, rows: any[]) {
    if (!rows || !rows.length) { alert('No rows to export'); return }
    const header = Object.keys(rows[0])
    const csv = [
        header.join(','),
        ...rows.map(r => header.map(k => {
            const v = r[k] ?? ''
            const s = typeof v === 'string' ? v : JSON.stringify(v)
            return `"${String(s).replace(/"/g, '""')}"`
        }).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
}

export function exportToPDF(data: Record<string, unknown>, filename = 'report.pdf') {
    // simple client-side PDF generation using window.print fallback or libraries (jsPDF / pdfmake)
    // For demo we open a printable window
    const html = `<html><head><title>Report</title></head><body><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`
    const w = window.open('about:blank')
    if (!w) return alert('Popup blocked')
    w.document.write(html)
    w.document.close()
    w.print()
}
