import { useEffect, useState } from "react"
import { getNotifications, markNotificationRead } from "../lib/notifications"

type Notification = {
    id: number
    title: string
    body: string
    read: boolean
    created: string
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        ; (async () => {
            const data = await getNotifications()
            setNotifications(data)
        })()
    }, [])

    async function markRead(id: number) {
        await markNotificationRead(id)
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
    }

    return (
        <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {notifications.length === 0 && (
                <div className="text-sm text-zinc-500">No notifications yet.</div>
            )}
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className={`p-2 rounded ${n.read ? "bg-zinc-100" : "bg-blue-100"}`}
                >
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm">{n.body}</div>
                    <div className="text-xs text-zinc-500">{new Date(n.created).toLocaleString()}</div>
                    {!n.read && (
                        <button
                            className="btn-xs btn-outline mt-1"
                            onClick={() => markRead(n.id)}
                        >
                            Mark as Read
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}
