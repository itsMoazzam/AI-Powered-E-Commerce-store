import { configureStore } from "@reduxjs/toolkit"
import cartReducer from "./Cart"
import authReducer from "./auth"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
