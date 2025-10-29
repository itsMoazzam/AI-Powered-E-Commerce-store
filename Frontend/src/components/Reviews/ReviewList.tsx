import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Review {
    id: number;
    user: string; // StringRelatedField => username
    rating?: number;
    text?: string;
    created?: string;
    parent?: number | null;
    replies?: Review[];
    status?: string;
}

export default function ReviewList({ productId }: { productId: number }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/reviews/products/${productId}/reviews/`);
            setReviews(data); // top-level reviews with nested replies
        } catch (err) {
            console.error("Failed to load reviews", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const renderReplies = (replies?: Review[], depth = 1) => {
        if (!replies || replies.length === 0) return null;
        return (
            <div className="ml-4 border-l pl-4 mt-3 space-y-3">
                {replies.map((r) => (
                    <div key={r.id} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start gap-3">
                            <div>
                                <div className="text-sm font-semibold text-gray-800">{r.user}</div>
                                <div className="text-xs text-gray-500">{new Date(r.created || "").toLocaleString()}</div>
                            </div>
                            <div className="text-sm text-yellow-500">{r.rating ? `⭐ ${r.rating}` : null}</div>
                        </div>

                        {r.text && <p className="mt-2 text-gray-700 text-sm">{r.text}</p>}

                        {renderReplies(r.replies, depth + 1)}
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return <div className="text-gray-500 animate-pulse p-4">Loading reviews…</div>;

    if (!reviews.length) return <div className="p-4 text-gray-500">No reviews yet — be the first to review.</div>;

    return (
        <div className="space-y-4">
            {reviews.map((rev) => (
                <div key={rev.id} className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex justify-between items-start gap-3">
                        <div>
                            <div className="text-sm font-semibold text-gray-800">{rev.user}</div>
                            <div className="text-xs text-gray-500">{new Date(rev.created || "").toLocaleString()}</div>
                        </div>

                        <div className="text-sm text-yellow-500">{rev.rating ? `⭐ ${rev.rating}` : null}</div>
                    </div>

                    {rev.text && <p className="mt-2 text-gray-700">{rev.text}</p>}

                    {/* nested replies */}
                    {renderReplies(rev.replies)}
                </div>
            ))}
        </div>
    );
}
