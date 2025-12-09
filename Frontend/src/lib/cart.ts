// Helper to normalize cart responses from backend
export function normalizeCartResponse(data: any) {
    const items = Array.isArray(data?.items) ? data.items.map((it: any) => {
        const qty = it.qty ?? it.quantity ?? it.cart_qty ?? 1
        const price = it.price ?? it.unit_price ?? (it.product?.price ?? 0)
        const title = it.product?.name || it.product?.title || it.title || 'Product'
        const thumbnail = it.product?.image || it.product?.thumbnail || it.thumbnail || ''

        return {
            id: it.id,
            title: String(title),
            thumbnail: String(thumbnail),
            price: Number(price) || 0,
            qty: Number(qty) || 1,
            subtotal: (Number(price) || 0) * (Number(qty) || 1),
            raw: it,
        }
    }) : []

    const subtotal = items.reduce((s: number, i: any) => s + i.subtotal, 0)
    const shippingCost = Number(data?.shipping ?? data?.shipping_cost ?? 0) || 0
    const total = Number(data?.total ?? subtotal) || subtotal
    const grandTotal = Number(data?.grand_total ?? data?.grandTotal ?? (total + shippingCost)) || (total + shippingCost)

    return {
        items,
        total,
        shipping: shippingCost,
        grand_total: grandTotal,
        raw: data,
    }
}

export default normalizeCartResponse
