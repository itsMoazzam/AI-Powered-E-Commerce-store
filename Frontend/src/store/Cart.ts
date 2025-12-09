// store/cart.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import api from "../lib/api"

type CartItem = {
    id: number | string
    title: string
    thumbnail: string
    price: number
    qty: number
}

type CartState = {
    items: CartItem[]
    loading: boolean
}

const initialState: CartState = {
    items: [],
    loading: false,
}

// ✅ fetch cart from backend
import { normalizeCartResponse } from "../lib/cart"

export const fetchCart = createAsyncThunk("cart/fetch", async () => {
    const { data } = await api.get("/api/cart/")
    const normalized = normalizeCartResponse(data)
    return normalized.items || []
})

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItem(state, action: PayloadAction<CartItem>) {
            state.items.push(action.payload)
        },
        removeItem(state, action: PayloadAction<number | string>) {
            state.items = state.items.filter((i) => i.id !== action.payload)
        },
        updateQty(state, action: PayloadAction<{ id: number | string; qty: number }>) {
            const item = state.items.find((i) => i.id === action.payload.id)
            if (item) item.qty = action.payload.qty
        },
        clearCart(state) {
            state.items = []
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCart.fulfilled, (state, action) => {
            state.items = action.payload
            state.loading = false
        })
        builder.addCase(fetchCart.pending, (state) => {
            state.loading = true
        })
    },
})

export const { addItem, removeItem, updateQty, clearCart } = cartSlice.actions
export default cartSlice.reducer
