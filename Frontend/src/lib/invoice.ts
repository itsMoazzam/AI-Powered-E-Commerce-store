export function printInvoice(order: any) {
    try {
        const html = [`
      <html>
      <head>
        <title>Invoice ${order?.id ?? ''}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 20px; color: #111 }
          h1 { font-size: 20px }
          table { width: 100%; border-collapse: collapse; margin-top: 12px }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left }
          th { background: #f7f7f7 }
        </style>
      </head>
      <body>
        <h1>Invoice ${order?.id ?? ''}</h1>
        <div>Placed: ${order?.created_at ?? new Date().toISOString()}</div>
        <div style="margin-top:12px">
          <strong>Shipping:</strong>
          <div>${JSON.stringify(order?.shipping_address ?? {}, null, 2)}</div>
        </div>
        <table>
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
          <tbody>
            ${((order?.items ?? []) as any[]).map(i => `
              <tr>
                <td>${i.name || i.title || i.product_name || i.product || 'Item'}</td>
                <td>${i.qty ?? i.quantity ?? 1}</td>
                <td>${(i.price ?? i.unit_price ?? 0).toFixed ? (i.price ?? i.unit_price ?? 0).toFixed(2) : (i.price ?? i.unit_price ?? 0)}</td>
                <td>${((i.qty ?? i.quantity ?? 1) * (i.price ?? i.unit_price ?? 0)).toFixed ? ((i.qty ?? i.quantity ?? 1) * (i.price ?? i.unit_price ?? 0)).toFixed(2) : ((i.qty ?? i.quantity ?? 1) * (i.price ?? i.unit_price ?? 0))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top:12px;font-weight:bold">Total: ${order?.total ?? order?.grand_total ?? 0}</div>
      </body>
      </html>
    `].join('')

        const w = window.open('', '_blank')
        if (!w) return
        w.document.open()
        w.document.write(html)
        w.document.close()
        // give the window a moment
        setTimeout(() => {
            try { w.focus(); w.print(); } catch (e) { /* ignore */ }
        }, 300)
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('printInvoice failed', err)
    }
}
