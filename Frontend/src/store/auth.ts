// src/store/auth.ts
import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { useSelector } from "react-redux"
import type { RootState } from "./index"

interface AuthState {
    token: string | null
    role: string | null
    user: { id: number; username: string; email: string } | null
}

const initialState: AuthState = {
    token: null,
    role: null,
    user: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<AuthState>) => {
            state.token = action.payload.token
            state.role = action.payload.role
            state.user = action.payload.user
        },
        logout: (state) => {
            state.token = null
            state.role = null
            state.user = null
        },
    },
})

export const { setAuth, logout } = authSlice.actions
export default authSlice.reducer

// ✅ safe custom hook
export const useAuth = () => useSelector((state: RootState) => state.auth)
