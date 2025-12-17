import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import api from "../../lib/api";
import { Trash2 } from "lucide-react";

interface Review {
    id: number;
    user: string; // StringRelatedField => username
    user_id?: number; // Add user ID for ownership check
    rating?: number;
    text?: string;
    created?: string;
    parent?: number | null;
    replies?: Review[];
    status?: string;
}

export interface ReviewListHandle {
    fetchReviews: () => Promise<void>;
}

const ReviewList = forwardRef<ReviewListHandle, { productId: number }>(({ productId }, ref) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    useEffect(() => {
        // Get current user info from user object stored in localStorage
        try {
            const userJson = localStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;
            const username = user?.username || user?.email || null;
            const role = localStorage.getItem('role');
            setCurrentUsername(username);
            setCurrentUserRole(role);
            console.log('Current user:', { username, role, user }); // Debug log
        } catch (err) {
            console.error('Failed to get current user info', err);
        }
    }, []);

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

    const handleDeleteReview = async (reviewId: number) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            await api.delete(`/api/reviews/reviews/${reviewId}/delete/`);
            // API returns 204 No Content, so just refresh the list
            await fetchReviews();
            // No need for alert since the review disappears immediately
        } catch (err: any) {
            console.error('Failed to delete review', err);
            const errorMessage = err?.response?.data?.message || err?.response?.data?.detail || 'Failed to delete review';
            alert(errorMessage);
        }
    };

    const canDeleteReview = (review: Review): boolean => {
        console.log('Checking delete permission:', { currentUsername, reviewUser: review.user, currentRole: currentUserRole }); // Debug log
        // Admin can delete any review
        if (currentUserRole === 'admin') return true;
        // Owner can delete their own review (case-insensitive comparison)
        if (currentUsername && review.user && currentUsername.toLowerCase().trim() === review.user.toLowerCase().trim()) {
            console.log('User can delete - owner match'); // Debug log
            return true;
        }
        return false;
    };

    useImperativeHandle(ref, () => ({
        fetchReviews,
    }));

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
                            <div className="flex items-center gap-2">
                                <div className="text-sm text-yellow-500">{r.rating ? `⭐ ${r.rating}` : null}</div>
                                {canDeleteReview(r) && (
                                    <button
                                        onClick={() => handleDeleteReview(r.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition"
                                        title="Delete review"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
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

                        <div className="flex items-center gap-2">
                            <div className="text-sm text-yellow-500">{rev.rating ? `⭐ ${rev.rating}` : null}</div>
                            {canDeleteReview(rev) && (
                                <button
                                    onClick={() => handleDeleteReview(rev.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition"
                                    title="Delete review"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {rev.text && <p className="mt-2 text-gray-700">{rev.text}</p>}

                    {/* nested replies */}
                    {renderReplies(rev.replies)}
                </div>
            ))}
        </div>
    );
});

ReviewList.displayName = 'ReviewList';
export default ReviewList;
