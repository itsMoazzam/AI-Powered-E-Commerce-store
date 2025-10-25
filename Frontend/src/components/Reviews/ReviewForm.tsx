import { useState } from "react";
import api from "../../lib/api";

export default function ReviewForm({ productId, onPosted }: { productId: number; onPosted?: () => void }) {
    const [rating, setRating] = useState<number>(5);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/api/reviews/products/${productId}/reviews/create/`, { rating, text });
            setText("");
            setRating(5);
            setMessage("Review submitted — awaiting moderation.");
            if (onPosted) {
                onPosted();
            }
        } catch (err: unknown) {
            console.error(err);
            setMessage("Failed to submit review.");
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3500);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Write a review</h3>

            <div>
                <label className="text-sm text-gray-700 block mb-1">Rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-28 border rounded px-2 py-1 text-gray-400">
                    {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star{r > 1 && "s"}</option>)}
                </select>
            </div>

            <div>
                <label className="text-sm text-gray-700 block mb-1">Your review</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full border rounded px-3 py-2 text-sm text-gray-500" placeholder="Share your experience..." />
            </div>

            <div className="flex items-center gap-3">
                <button disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    {loading ? "Posting…" : "Post review"}
                </button>
                {message && <div className="text-sm text-gray-600">{message}</div>}
            </div>
        </form>
    );
}
