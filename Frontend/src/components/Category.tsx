import { useEffect, useState } from "react";
import api from "../lib/api";
import { Plus } from "lucide-react";

interface Category {
    id: number;
    name: string;
    children?: Category[];
}

type Props = {
    onSelect: (id: number) => void;
    selectedId?: number | null;
};

const CategorySelector: React.FC<Props> = ({ onSelect, selectedId }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [parentId, setParentId] = useState<string>("");
    const [childId, setChildId] = useState<string>("");
    const [newCategory, setNewCategory] = useState("");
    const [isChild, setIsChild] = useState(false);

    // Fetch categories from backend
    useEffect(() => {
        api.get("/api/products/categories/")
            .then(res => setCategories(res.data))
            .catch(console.error);
    }, []);

    // Notify parent on selection
    useEffect(() => {
        if (childId) onSelect(Number(childId));
        else if (parentId) onSelect(Number(parentId));
    }, [parentId, childId]);

    // Add new category
    const handleAddCategory = async () => {
        if (!newCategory) return alert("Category name required!");
        const { data } = await api.post("/api/products/categories/", {
            name: newCategory,
            parent: isChild ? Number(parentId) : null,
        });

        if (isChild && parentId) {
            setCategories(prev =>
                prev.map(cat =>
                    cat.id === Number(parentId)
                        ? { ...cat, children: [...(cat.children ?? []), data] }
                        : cat
                )
            );
        } else {
            setCategories(prev => [...prev, data]);
        }
        setNewCategory("");
        alert("✅ Category added!");
    };

    const selectedParent = categories.find(c => c.id === Number(parentId));
    const children = selectedParent?.children ?? [];

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category</label>

            {/* Parent Dropdown */}
            <select
                className="input"
                value={parentId}
                onChange={e => {
                    setParentId(e.target.value);
                    setChildId("");
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
                    className="input"
                    value={childId}
                    onChange={e => setChildId(e.target.value)}
                >
                    <option value="">-- Select Child Category --</option>
                    {children.map(child => (
                        <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                </select>
            )}

            {/* Add New Category */}
            <div className="flex gap-2 items-center">
                <input
                    type="text"
                    className="input flex-1"
                    placeholder="New category name"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                />
                <select
                    className="border rounded px-2 py-1 text-sm text-gray-600"
                    value={isChild ? "child" : "parent"}
                    onChange={e => setIsChild(e.target.value === "child")}
                >
                    <option value="parent">Parent</option>
                    <option value="child" disabled={!parentId}>Child</option>
                </select>
                <button
                    type="button"
                    className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700"
                    onClick={handleAddCategory}
                >
                    <Plus size={14} /> Add
                </button>
            </div>
        </div>
    );
};

export default CategorySelector;
