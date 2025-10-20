// src/store/auth.ts
import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
export type Role = "customer" | "seller" | "admin" | null

export interface UserShape {
    id?: number
    username?: string
    email?: string
    role?: Role
    is_superuser?: boolean
    first_name?: string
    last_name?: string
}

export interface AuthState {
    token: string | null
    role: Role
    user: UserShape | null
}

const initialToken = (() => {
    try {
        const t = localStorage.getItem("token")
        return t && t !== "null" && t !== "undefined" ? t : null
    } catch {
        return null
    }
})()

const initialState: AuthState = {
    token: initialToken,
    role: (() => {
        try {
            const r = localStorage.getItem("role")
            return r === "customer" || r === "seller" || r === "admin" ? (r as Role) : null
        } catch {
            return null
        }
    })(),
    user: initialToken ? (JSON.parse(localStorage.getItem("user") || "null") as UserShape | null) : null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<AuthState>) => {
            const { token, role, user } = action.payload
            state.token = token ?? null
            state.role = role ?? null
            state.user = user ?? null

            if (token) localStorage.setItem("token", token)
            else localStorage.removeItem("token")

            if (role) localStorage.setItem("role", role)
            else localStorage.removeItem("role")

            if (user) localStorage.setItem("user", JSON.stringify(user))
            else localStorage.removeItem("user")
        },
        clearAuth: (state) => {
            state.token = null
            state.role = null
            state.user = null
            localStorage.removeItem("token")
            localStorage.removeItem("role")
            localStorage.removeItem("user")
        },
    },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
