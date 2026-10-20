import React from 'react';
import { CuisineCategory } from '../types';
import { useApp } from '../context/AppContext';
import { categoryLabels } from '../utils/translations';
import {
  Utensils,
  Flame,
  Soup,
  Pizza,
  Sandwich,
  Drumstick,
  CookingPot,
  Sparkles,
  Coffee,
  Tag,
} from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: CuisineCategory;
  onSelectCategory: (cat: CuisineCategory) => void;
}

const CATEGORY_ITEMS: { key: CuisineCategory; icon: React.FC<{ className?: string }> }[] = [
  { key: 'all', icon: Utensils },
  { key: 'deals', icon: Tag },
  { key: 'pizza', icon: Pizza },
  { key: 'karahi', icon: Soup },
  { key: 'bbq', icon: Flame },
  { key: 'biryani', icon: CookingPot },
  { key: 'sohan_halwa', icon: Sparkles },
  { key: 'burgers', icon: Sandwich },
  { key: 'fast_food', icon: Drumstick },
  { key: 'desi', icon: CookingPot },
  { key: 'beverages', icon: Coffee },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { language } = useApp();

  return (
    <div className="py-6 border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {CATEGORY_ITEMS.map(({ key, icon: Icon }) => {
            const isSelected = selectedCategory === key;
            const label = categoryLabels[language][key];
            return (
              <button
                key={key}
                onClick={() => onSelectCategory(key)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-800 text-white shadow-sm font-semibold'
                    : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-neutral-500'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
