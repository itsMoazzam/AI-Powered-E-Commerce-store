// src/components/Protected.tsx
import React from "react"
import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../store/index"

export default function Protected({
    children,
    allow,
}: {
    children: React.ReactNode
    allow?: Array<"customer" | "seller" | "admin">
}) {
    const { token, role } = useSelector((state: RootState) => state.auth)

    if (!token) return <Navigate to="/auth/login" replace />
    if (allow && role && !allow.includes(role)) return <Navigate to="/" replace />

    return <>{children}</>
}
