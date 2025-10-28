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
    const [stepChildId, setStepChildId] = useState<string>("");
    const [newCategory, setNewCategory] = useState("");
    const [level, setLevel] = useState<"parent" | "child" | "stepchild">("parent");

    // ✅ Fetch categories from backend
    useEffect(() => {
        api.get("/api/products/categories/")
            .then(res => setCategories(res.data))
            .catch(console.error);
    }, []);

    // ✅ Notify parent on selection
    useEffect(() => {
        if (stepChildId) onSelect(Number(stepChildId));
        else if (childId) onSelect(Number(childId));
        else if (parentId) onSelect(Number(parentId));
    }, [parentId, childId, stepChildId]);

    // ✅ Add new category (can be parent, child, or stepchild)
    const handleAddCategory = async () => {
        if (!newCategory) return alert("⚠️ Category name required!");

        let parent = null;
        if (level === "child" && parentId) parent = Number(parentId);
        if (level === "stepchild" && childId) parent = Number(childId);

        const { data } = await api.post("/api/products/categories/", {
            name: newCategory,
            parent,
        });

        // update state dynamically
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
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Category</label>

            {/* Parent Dropdown */}
            <select
                className="input-field"
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
                    className="input-field"
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
                    className="input-field"
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
            <div className="flex gap-2 items-center">
                <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="New category name"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                />
                <select
                    className="border rounded cursor-pointer px-2 py-1 text-sm text-gray-600"
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
                    className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-[4px] cursor-pointer rounded hover:bg-indigo-700"
                    onClick={handleAddCategory}
                >
                    <Plus size={14} /> Add
                </button>
            </div>
        </div>
    );
};

export default CategorySelector;
