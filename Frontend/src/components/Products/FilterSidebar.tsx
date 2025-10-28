import { useState } from 'react';

interface FilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  price__gte: number;
  price__lte: number;
  discount__gte: number;
  title__icontains: string;
  description__icontains: string;
  category_slug?: string;
  [key: string]: string | number | boolean | undefined;
}

export default function FilterSidebar({ onFilterChange }: FilterProps) {
  const [filters, setFilters] = useState<FilterValues>({
    price__gte: 0,
    price__lte: 10000,
    discount__gte: 0,
    title__icontains: '',
    description__icontains: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDirty, setIsDirty] = useState(false);

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
  };

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 right-4 z-50 md:hidden bg-blue-500 text-white p-3 rounded-full shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 transform ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition duration-200 ease-in-out z-50 w-72 bg-white p-4 border-r overflow-y-auto h-screen md:h-auto`}
      >
        <div className="flex justify-between items-center mb-4 md:hidden">
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 hover:bg-gray-100 rounded"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="md:hidden mb-4 border-b pb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
      
        {/* Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Search Products</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleChange('title__icontains', e.target.value);
              handleChange('description__icontains', e.target.value);
            }}
            placeholder="Search by title or description"
            className="w-full px-3 py-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
              className="w-24 px-2 py-1 border rounded"
              min={0}
            />
            <span>-</span>
            <input
              type="number"
              value={filters.price__lte}
              onChange={(e) => handleChange('price__lte', Number(e.target.value))}
              className="w-24 px-2 py-1 border rounded"
              min={0}
            />
          </div>
        </div>

        {/* Minimum Discount */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Minimum Discount (%)</label>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.discount__gte || 0}
            onChange={(e) => handleChange('discount__gte', Number(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-600">{filters.discount__gte || 0}%</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Show Products Button */}
          <button
            onClick={handleApplyFilters}
            className={`w-full py-2 ${
              isDirty 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-100 text-gray-400'
            } rounded transition-colors duration-200`}
            disabled={!isDirty}
          >
            Show Products
          </button>

          {/* Reset Filters */}
          <button
            onClick={() => {
              const defaultFilters: FilterValues = {
                price__gte: 0,
                price__lte: 10000,
                discount__gte: 0,
                title__icontains: '',
                description__icontains: ''
              };
              setFilters(defaultFilters);
              setSearchTerm('');
              onFilterChange(defaultFilters);
              setIsDirty(false);
            }}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </>
  );
}