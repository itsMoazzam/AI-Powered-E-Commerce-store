import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { X } from 'lucide-react';

interface FilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  price__gte: number;
  price__lte: number;
  discount__gte: number;
  search_text?: string;
  category_slug?: string;
  [key: string]: string | number | boolean | undefined;
}

export default function FilterSidebar({ onFilterChange }: FilterProps) {
  const { primary } = useTheme();
  const [filters, setFilters] = useState<FilterValues>({
    price__gte: 0,
    price__lte: 10000,
    discount__gte: 0,
    search_text: undefined,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleChange = (key: keyof FilterValues, value: string | number | boolean) => {
    const newFilters = { ...filters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setFilters(newFilters);
    setIsDirty(true);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
    setIsDirty(false);
    setIsMobileOpen(false);
  };

  const handleReset = () => {
    const defaultFilters: FilterValues = {
      price__gte: 0,
      price__lte: 10000,
      discount__gte: 0,
      search_text: undefined,
    };
    setFilters(defaultFilters);
    setSearchTerm('');
    onFilterChange(defaultFilters);
    setIsDirty(false);
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 right-4 z-50 md:hidden p-3 rounded-full shadow-lg transition hover:scale-110"
        style={{ background: primary, color: 'var(--color-primary-text)' }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </button>

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:sticky inset-y-0 left-0 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-50 md:z-40 w-72 p-4 border-r overflow-y-auto-hide-scroll md:max-h-[calc(100vh-5rem)]`}
        style={{ background: 'var(--surface)', color: 'var(--text)', top: '4rem' }}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Search Products</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value.trim();
              setSearchTerm(e.target.value);
              setFilters(prev => ({
                ...prev,
                search_text: value || undefined
              }));
              setIsDirty(true);
            }}
            placeholder="Search by title..."
            className="input-responsive w-full"
            style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
          />
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Price Range</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={filters.price__gte}
              onChange={(e) => handleChange('price__gte', Number(e.target.value))}
              className="input-responsive flex-1"
              style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
              min={0}
              placeholder="Min"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={filters.price__lte}
              onChange={(e) => handleChange('price__lte', Number(e.target.value))}
              className="input-responsive flex-1"
              style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--card-border)' }}
              min={0}
              placeholder="Max"
            />
          </div>
          <div className="text-xs text-muted mt-1">
            ${filters.price__gte} - ${filters.price__lte}
          </div>
        </div>

        {/* Discount Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Minimum Discount (%)</label>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.discount__gte || 0}
            onChange={(e) => handleChange('discount__gte', Number(e.target.value))}
            className="w-full cursor-pointer"
            style={{
              accentColor: primary,
            }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium">{filters.discount__gte || 0}%</span>
            <span className="text-xs text-muted">Max 100%</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-card my-6" />

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleApplyFilters}
            disabled={!isDirty}
            className="w-full py-2.5 rounded-lg font-medium transition-all duration-200"
            style={{
              background: isDirty ? primary : 'var(--bg)',
              color: isDirty ? 'var(--color-primary-text)' : 'var(--text)',
              opacity: isDirty ? 1 : 0.5,
              cursor: isDirty ? 'pointer' : 'not-allowed'
            }}
          >
            {isDirty ? 'Apply Filters' : 'No Changes'}
          </button>

          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-lg font-medium border transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
          >
            Reset Filters
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 pt-4 border-t border-card text-xs text-muted space-y-1">
          <div>💡 Use range sliders to narrow down options</div>
          <div>🔍 Search for specific products</div>
        </div>
      </div>
    </>
  );
}
