import { useState } from "react";
import api from "../../lib/api";

export default function ReplyForm({
    parentId,
    onPosted,
    small = false,
}: {
    parentId: number;
    onPosted?: () => void;
    small?: boolean;
}) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const submitReply = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        try {
            await api.post(`/api/reviews/${parentId}/reply/`, { text });
            setText("");
            setOpen(false);
            if (onPosted) {
                onPosted();
            }
        } catch (err) {
            console.error("Reply failed", err);
        } finally {
            setLoading(false);
        }
    };

    if (small) {
        return (
            <div>
                <button onClick={() => setOpen((s) => !s)} className="text-sm text-indigo-600 hover:underline">
                    Reply
                </button>
                {open && (
                    <form onSubmit={submitReply} className="mt-2">
                        <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded p-2 text-sm" />
                        <div className="mt-2 flex gap-2">
                            <button type="submit" disabled={loading} className="text-sm bg-indigo-600 text-white px-3 py-1 rounded">
                                {loading ? "Posting…" : "Send"}
                            </button>
                            <button type="button" onClick={() => setOpen(false)} className="text-sm border px-3 py-1 rounded">
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    }

    // full form version
    return (
        <form onSubmit={submitReply} className="w-full">
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply..." className="w-full border rounded p-2 text-sm" />
            <div className="mt-2 flex gap-2">
                <button disabled={loading} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">{loading ? "Posting…" : "Reply"}</button>
                <button type="button" onClick={() => setText("")} className="text-sm border px-3 py-1 rounded">Reset</button>
            </div>
        </form>
    );
}
