import { useEffect, useState } from "react";
import api from "../lib/api";
import { Plus } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";

interface Category {
    id: number;
    name: string;
    children?: Category[];
}

type Props = {
    onSelect: (id: number) => void;
    selectedId?: number | null;
};

const CategorySelector: React.FC<Props> = ({ onSelect }) => {
    const { primary } = useTheme();
    const [categories, setCategories] = useState<Category[]>([]);
    const [parentId, setParentId] = useState<string>("");
    const [childId, setChildId] = useState<string>("");
    const [stepChildId, setStepChildId] = useState<string>("");
    const [newCategory, setNewCategory] = useState("");
    const [level, setLevel] = useState<"parent" | "child" | "stepchild">("parent");

    // Fetch categories from backend
    useEffect(() => {
        api.get("/api/products/categories/")
            .then(res => setCategories(res.data))
            .catch(console.error);
    }, []);

    // Notify parent on selection
    useEffect(() => {
        if (stepChildId) onSelect(Number(stepChildId));
        else if (childId) onSelect(Number(childId));
        else if (parentId) onSelect(Number(parentId));
    }, [parentId, childId, stepChildId]);

    // Add new category
    const handleAddCategory = async () => {
        if (!newCategory) return alert("⚠️ Category name required!");

        let parent = null;
        if (level === "child" && parentId) parent = Number(parentId);
        if (level === "stepchild" && childId) parent = Number(childId);

        const { data } = await api.post("/api/products/categories/", {
            name: newCategory,
            parent,
        });

        if (level === "parent") {
            setCategories(prev => [...prev, data]);
        } else if (level === "child" && parentId) {
            setCategories(prev =>
                prev.map(cat =>
                    cat.id === Number(parentId)
                        ? { ...cat, children: [...(cat.children ?? []), data] }
                        : cat
                )
            );
        } else if (level === "stepchild" && childId && parentId) {
            setCategories(prev =>
                prev.map(cat =>
                    cat.id === Number(parentId)
                        ? {
                            ...cat,
                            children: cat.children?.map(child =>
                                child.id === Number(childId)
                                    ? { ...child, children: [...(child.children ?? []), data] }
                                    : child
                            ),
                        }
                        : cat
                )
            );
        }

        setNewCategory("");
        alert("✅ Category added!");
    };

    const selectedParent = categories.find(c => c.id === Number(parentId));
    const children = selectedParent?.children ?? [];
    const selectedChild = children.find(c => c.id === Number(childId));
    const stepChildren = selectedChild?.children ?? [];

    return (
        <div className="space-y-4 responsive-container">
            <label className="block text-sm font-semibold text-default">Category Selection</label>

            {/* Parent Dropdown */}
            <select
                className="input-responsive input-field w-full"
                style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                value={parentId}
                onChange={e => {
                    setParentId(e.target.value);
                    setChildId("");
                    setStepChildId("");
                }}
            >
                <option value="">-- Select Parent Category --</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            {/* Child Dropdown */}
            {children.length > 0 && (
                <select
                    className="input-responsive input-field w-full"
                    style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                    value={childId}
                    onChange={e => {
                        setChildId(e.target.value);
                        setStepChildId("");
                    }}
                >
                    <option value="">-- Select Child Category --</option>
                    {children.map(child => (
                        <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                </select>
            )}

            {/* Stepchild Dropdown */}
            {stepChildren.length > 0 && (
                <select
                    className="input-responsive input-field w-full"
                    style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                    value={stepChildId}
                    onChange={e => setStepChildId(e.target.value)}
                >
                    <option value="">-- Select Stepchild Category --</option>
                    {stepChildren.map(sc => (
                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                </select>
            )}

            {/* Add New Category */}
            <div className="responsive-flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <input
                    type="text"
                    className="input-responsive border rounded px-2 py-2 text-sm m-1 flex-1 min-w-0"
                    style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                    placeholder="New category name"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                />
                <select
                    className="input-responsive border rounded px-2 py-2 text-sm"
                    style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
                    value={level}
                    onChange={e =>
                        setLevel(e.target.value as "parent" | "child" | "stepchild")
                    }
                >
                    <option value="parent">Parent</option>
                    <option value="child" disabled={!parentId}>Child</option>
                    <option value="stepchild" disabled={!childId}>Stepchild</option>
                </select>
                <button
                    type="button"
                    className="flex items-center justify-center gap-1 text-white px-4 py-2 cursor-pointer rounded font-medium transition hover:shadow-lg hover:scale-105 w-full sm:w-auto"
                    style={{ background: primary, color: 'var(--color-primary-text)' }}
                    onClick={handleAddCategory}
                >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Add</span>
                    <span className="sm:hidden">+</span>
                </button>
            </div>

            {/* Info Box */}
            <div className="p-3 rounded-lg border border-card text-xs text-muted" style={{ background: 'var(--surface)' }}>
                <div>ℹ️ Parent categories appear first. Children nest under parents. Grandchildren nest under children.</div>
            </div>
        </div>
    );
};

export default CategorySelector;
