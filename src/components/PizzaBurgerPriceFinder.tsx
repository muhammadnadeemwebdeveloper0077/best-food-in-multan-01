import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations, neighbourhoodLabels } from '../utils/translations';
import { MenuItem, Restaurant, MultanNeighbourhood, PizzaSize, BurgerType } from '../types';
import {
  SlidersHorizontal,
  Search,
  Sparkles,
  Phone,
  MessageCircle,
  ExternalLink,
  RotateCcw,
  Tag,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Utensils,
  ChevronRight,
  Flame,
  BadgeCheck,
  MapPin,
  Plus,
} from 'lucide-react';

interface PizzaBurgerPriceFinderProps {
  onSelectItem?: (item: MenuItem, restaurant: Restaurant) => void;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
}

export const PizzaBurgerPriceFinder: React.FC<PizzaBurgerPriceFinderProps> = ({
  onSelectItem,
  onSelectRestaurant,
}) => {
  const {
    language,
    menuItems,
    restaurants,
    setSelectedRestaurantId,
    setView,
    addToCart,
  } = useApp();

  const t = translations[language];

  // Search & Filter States
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pizza' | 'burgers'>('all');
  const [minPrice, setMinPrice] = useState<number>(200);
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [selectedArea, setSelectedArea] = useState<MultanNeighbourhood | 'All Areas'>('All Areas');
  const [selectedPizzaSize, setSelectedPizzaSize] = useState<PizzaSize | 'all'>('all');
  const [selectedBurgerType, setSelectedBurgerType] = useState<BurgerType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'prep_time'>('price_asc');
  const [dealsOnly, setDealsOnly] = useState<boolean>(false);
  const [activeBudgetPreset, setActiveBudgetPreset] = useState<string>('custom');

  // Quick budget presets
  const budgetPresets = [
    { id: 'all', label: language === 'ur' ? 'تمام بجٹ' : 'All Budgets', min: 150, max: 4000 },
    { id: 'under500', label: language === 'ur' ? '500 سے کم (بجٹ)' : 'Under Rs. 500', min: 150, max: 500 },
    { id: '500to1000', label: language === 'ur' ? 'Rs. 500 – 1,000' : 'Rs. 500 – 1,000', min: 500, max: 1000 },
    { id: '1000to2000', label: language === 'ur' ? 'Rs. 1,000 – 2,000' : 'Rs. 1,000 – 2,000', min: 1000, max: 2000 },
    { id: 'family2000', label: language === 'ur' ? 'Rs. 2,000+ (فیملی)' : 'Rs. 2,000+ (Family)', min: 2000, max: 4500 },
  ];

  const handleApplyPreset = (preset: typeof budgetPresets[0]) => {
    setActiveBudgetPreset(preset.id);
    setMinPrice(preset.min);
    setMaxPrice(preset.max);
  };

  // Slider change handlers with cross-limit protection
  const handleMinSliderChange = (val: number) => {
    setActiveBudgetPreset('custom');
    if (val > maxPrice) {
      setMinPrice(maxPrice);
    } else {
      setMinPrice(val);
    }
  };

  const handleMaxSliderChange = (val: number) => {
    setActiveBudgetPreset('custom');
    if (val < minPrice) {
      setMaxPrice(minPrice);
    } else {
      setMaxPrice(val);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setMinPrice(200);
    setMaxPrice(1500);
    setSelectedArea('All Areas');
    setSelectedPizzaSize('all');
    setSelectedBurgerType('all');
    setSearchQuery('');
    setSortBy('price_asc');
    setDealsOnly(false);
    setActiveBudgetPreset('custom');
  };

  // Restaurant lookup map for fast details
  const restaurantMap = useMemo(() => {
    const map = new Map<string, Restaurant>();
    restaurants.forEach(r => map.set(r.id, r));
    return map;
  }, [restaurants]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Must be a pizza or burger item
      const isPizza =
        item.category === 'pizza' ||
        item.name.toLowerCase().includes('pizza') ||
        item.name.toLowerCase().includes('slice') ||
        item.description.toLowerCase().includes('pizza');

      const isBurger =
        item.category === 'burgers' ||
        item.name.toLowerCase().includes('burger') ||
        item.name.toLowerCase().includes('zinger') ||
        item.name.toLowerCase().includes('bun kabab') ||
        item.description.toLowerCase().includes('burger');

      if (!isPizza && !isBurger) {
        return false;
      }

      // Category filter (pizza vs burger)
      if (selectedCategory === 'pizza' && !isPizza) return false;
      if (selectedCategory === 'burgers' && !isBurger) return false;

      // Price filter
      if (item.pricePKR < minPrice || item.pricePKR > maxPrice) {
        return false;
      }

      // Deals only filter
      if (dealsOnly && !item.dealBadge && !item.originalPricePKR && item.category !== 'deals') {
        return false;
      }

      // Restaurant & Area filter
      const rest = restaurantMap.get(item.restaurantId);
      if (selectedArea !== 'All Areas') {
        if (!rest || rest.neighbourhood !== selectedArea) {
          return false;
        }
      }

      // Pizza size filter
      if (selectedPizzaSize !== 'all' && isPizza) {
        if (item.pizzaSize && item.pizzaSize !== selectedPizzaSize) {
          return false;
        }
      }

      // Burger type filter
      if (selectedBurgerType !== 'all' && isBurger) {
        if (item.burgerType && item.burgerType !== selectedBurgerType) {
          return false;
        }
      }

      // Search Query filter (item name, description, restaurant name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const restName = rest?.name.toLowerCase() || '';
        const restNameUr = rest?.nameUr || '';
        const matchName =
          item.name.toLowerCase().includes(q) ||
          item.nameUr.includes(q) ||
          item.description.toLowerCase().includes(q) ||
          restName.includes(q) ||
          restNameUr.includes(q);

        if (!matchName) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') {
        return a.pricePKR - b.pricePKR;
      } else if (sortBy === 'price_desc') {
        return b.pricePKR - a.pricePKR;
      } else if (sortBy === 'prep_time') {
        return a.preparationTimeMin - b.preparationTimeMin;
      } else if (sortBy === 'rating') {
        const ratingA = restaurantMap.get(a.restaurantId)?.rating || 0;
        const ratingB = restaurantMap.get(b.restaurantId)?.rating || 0;
        return ratingB - ratingA;
      }
      return 0;
    });
  }, [
    menuItems,
    selectedCategory,
    minPrice,
    maxPrice,
    dealsOnly,
    selectedArea,
    selectedPizzaSize,
    selectedBurgerType,
    searchQuery,
    sortBy,
    restaurantMap,
  ]);

  const handleViewRestaurant = (rest: Restaurant) => {
    if (onSelectRestaurant) {
      onSelectRestaurant(rest);
    } else {
      setSelectedRestaurantId(rest.id);
      setView('restaurant-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOrderDirect = (item: MenuItem, rest: Restaurant) => {
    if (onSelectItem) {
      onSelectItem(item, rest);
    } else {
      addToCart(item, 1);
    }
  };

  return (
    <div
      id="pizza-burger-finder"
      className="bg-white border-y border-amber-200/80 shadow-sm relative overflow-hidden transition-all"
    >
      {/* Decorative Warm Backsplash Gradient */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
      <div className="absolute -right-24 -top-24 w-72 h-72 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-24 bottom-0 w-72 h-72 bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9 relative">
        {/* Main Header & Wordmark */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {language === 'ur'
                  ? 'ملتان کا پہلا اسمارٹ پرائس فائنڈر'
                  : 'Multan’s Live Food Budget Search'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
              <span>🍕 Pizza & 🍔 Burger Price Finder</span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-1">
              {language === 'ur'
                ? 'ملتان میں اپنے بجٹ کے مطابق بہترین پیزا اور برگر دریافت کریں اور ریسٹورنٹس کے ریٹس کا موازنہ کریں'
                : 'Find your favourite food at your exact budget in Multan! Compare verified restaurant prices and deals.'}
            </p>
          </div>

          {/* Quick Active Budget Summary Badge */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              PKR
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-900">
                {t.yourBudget}
              </div>
              <div className="text-base sm:text-lg font-extrabold text-amber-950">
                Rs. {minPrice} – Rs. {maxPrice}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PRIMARY FILTER CONTROLS CARD
           ========================================================================= */}
        <div className="bg-neutral-50/90 border border-neutral-200 rounded-3xl p-4 sm:p-6 mb-7 shadow-xs">
          {/* Row 1: Category Selector Pills + Budget Presets */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 pb-5 border-b border-neutral-200">
            {/* Category Selector */}
            <div className="lg:col-span-5">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                {language === 'ur' ? 'کھانے کی کیٹیگری منتخب کریں' : '1. Choose Category'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-amber-800 text-white shadow-sm ring-2 ring-amber-700 ring-offset-1'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <span>🍕🍔</span>
                  <span>{language === 'ur' ? 'تمام' : 'All'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('pizza')}
                  className={`px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedCategory === 'pizza'
                      ? 'bg-amber-800 text-white shadow-sm ring-2 ring-amber-700 ring-offset-1'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <span>🍕</span>
                  <span>{language === 'ur' ? 'صرف پیزا' : 'Pizza'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('burgers')}
                  className={`px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedCategory === 'burgers'
                      ? 'bg-amber-800 text-white shadow-sm ring-2 ring-amber-700 ring-offset-1'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <span>🍔</span>
                  <span>{language === 'ur' ? 'صرف برگر' : 'Burger'}</span>
                </button>
              </div>
            </div>

            {/* Quick Budget Presets */}
            <div className="lg:col-span-7">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                {t.quickBudgets}
              </label>
              <div className="flex flex-wrap gap-2">
                {budgetPresets.map(preset => {
                  const isActive = activeBudgetPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                        isActive
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold shadow-xs'
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Dual Synchronized Budget Sliders & Numeric Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 pb-5 border-b border-neutral-200">
            {/* Minimum Price Control */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/90">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wide">
                  {t.minPrice}
                </span>
                <div className="flex items-center gap-1 font-extrabold text-amber-800 text-base">
                  <span>Rs.</span>
                  <input
                    type="number"
                    min={150}
                    max={maxPrice}
                    step={50}
                    value={minPrice}
                    onChange={e => handleMinSliderChange(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 text-right font-extrabold text-amber-900 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm"
                  />
                </div>
              </div>
              <input
                type="range"
                min={150}
                max={4000}
                step={50}
                value={minPrice}
                onChange={e => handleMinSliderChange(Number(e.target.value))}
                className="w-full accent-amber-700 cursor-pointer h-2 bg-neutral-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-neutral-400 mt-1 font-mono">
                <span>Rs. 150</span>
                <span>Rs. 2,000</span>
                <span>Rs. 4,000</span>
              </div>
            </div>

            {/* Maximum Price Control */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/90">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wide">
                  {t.maxPrice}
                </span>
                <div className="flex items-center gap-1 font-extrabold text-amber-800 text-base">
                  <span>Rs.</span>
                  <input
                    type="number"
                    min={minPrice}
                    max={5000}
                    step={50}
                    value={maxPrice}
                    onChange={e => handleMaxSliderChange(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 text-right font-extrabold text-amber-900 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm"
                  />
                </div>
              </div>
              <input
                type="range"
                min={150}
                max={5000}
                step={50}
                value={maxPrice}
                onChange={e => handleMaxSliderChange(Number(e.target.value))}
                className="w-full accent-amber-700 cursor-pointer h-2 bg-neutral-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-neutral-400 mt-1 font-mono">
                <span>Rs. 150</span>
                <span>Rs. 2,500</span>
                <span>Rs. 5,000</span>
              </div>
            </div>
          </div>

          {/* Row 3: Area, Pizza Size, Burger Type, and Keyword Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Area Filter */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.multanAreaLabel}</span>
              </label>
              <select
                value={selectedArea}
                onChange={e => setSelectedArea(e.target.value as any)}
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                <option value="All Areas">{t.allNeighbourhoods}</option>
                <option value="Gulgasht Colony">{neighbourhoodLabels[language]['Gulgasht Colony']}</option>
                <option value="Bosan Road">{neighbourhoodLabels[language]['Bosan Road']}</option>
                <option value="Multan Cantt">{neighbourhoodLabels[language]['Multan Cantt']}</option>
                <option value="Chowk Kutchery">{neighbourhoodLabels[language]['Chowk Kutchery']}</option>
                <option value="Shah Rukn-e-Alam Colony">{neighbourhoodLabels[language]['Shah Rukn-e-Alam Colony']}</option>
                <option value="Northern Bypass">{neighbourhoodLabels[language]['Northern Bypass']}</option>
                <option value="Nishtar Road">{neighbourhoodLabels[language]['Nishtar Road']}</option>
              </select>
            </div>

            {/* Pizza Size (if Pizza or All) */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span>🍕</span>
                <span>{t.pizzaSizeLabel}</span>
              </label>
              <select
                value={selectedPizzaSize}
                onChange={e => setSelectedPizzaSize(e.target.value as any)}
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                <option value="all">{language === 'ur' ? 'تمام سائز' : 'All Sizes'}</option>
                <option value="small">{language === 'ur' ? 'اسمال / سولو (7"-8")' : 'Small (7"-8" Solo)'}</option>
                <option value="medium">{language === 'ur' ? 'میڈیم پین (9"-12")' : 'Medium (9"-12")'}</option>
                <option value="large">{language === 'ur' ? 'لارج / 15" XL' : 'Large (13"-15" XL)'}</option>
                <option value="family">{language === 'ur' ? 'فیملی کمبو ڈیل' : 'Family Feast Combo'}</option>
                <option value="monster_slice">{language === 'ur' ? '20" مونسٹر سلائس' : '20" Monster Slice'}</option>
              </select>
            </div>

            {/* Burger Type (if Burger or All) */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span>🍔</span>
                <span>{t.burgerTypeLabel}</span>
              </label>
              <select
                value={selectedBurgerType}
                onChange={e => setSelectedBurgerType(e.target.value as any)}
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                <option value="all">{language === 'ur' ? 'تمام اقسام' : 'All Burger Types'}</option>
                <option value="zinger">{language === 'ur' ? 'کرسپی زنگر چکن' : 'Crispy Zinger Chicken'}</option>
                <option value="beef">{language === 'ur' ? 'پرائم جوسی بیف' : 'Juicy Prime Beef'}</option>
                <option value="cheese">{language === 'ur' ? 'ڈبل چیڈر چیز برگر' : 'Double Cheese Melt'}</option>
                <option value="chicken">{language === 'ur' ? 'کوئلہ گرلڈ چکن' : 'Charcoal Grilled Chicken'}</option>
                <option value="egg_shami">{language === 'ur' ? 'ملتانی انڈا شامی بن کباب' : 'Multani Egg & Shami Bun Kabab'}</option>
              </select>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'ur' ? 'نام یا ریسٹورنٹ' : 'Search Item / Joint'}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.searchFoodPlaceholder}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Row 4: Sort By, Deals Toggle & Clear Filters Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-semibold text-neutral-700">{t.sortByLabel}:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-amber-600"
                >
                  <option value="price_asc">{t.sortLowToHigh}</option>
                  <option value="price_desc">{t.sortHighToLow}</option>
                  <option value="rating">{t.sortTopRated}</option>
                  <option value="prep_time">{t.sortFastPrep}</option>
                </select>
              </div>

              {/* Deals Only Toggle */}
              <label className="flex items-center gap-2 cursor-pointer bg-white border border-neutral-200 px-3 py-1 rounded-lg hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={dealsOnly}
                  onChange={e => setDealsOnly(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 accent-amber-700 w-3.5 h-3.5"
                />
                <span className="font-semibold text-neutral-700 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span>{t.activeDealsOnly}</span>
                </span>
              </label>
            </div>

            {/* Clear All Filters Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-neutral-600 hover:text-amber-800 hover:bg-amber-50 transition-colors font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.clearFilters}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            RESULTS SUMMARY BAR
           ========================================================================= */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-neutral-800">
              {filteredItems.length} {t.matchingResults}
            </span>
            <span className="text-xs text-neutral-500 hidden sm:inline">
              (Rs. {minPrice} – Rs. {maxPrice})
            </span>
          </div>

          <div className="text-xs text-neutral-500">
            {language === 'ur'
              ? 'تمام قیمتیں پاکستانی روپے (PKR) میں ہیں'
              : 'All prices in PKR (Rs.)'}
          </div>
        </div>

        {/* =========================================================================
            RESULTS GRID (CARDS)
           ========================================================================= */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map(item => {
              const rest = restaurantMap.get(item.restaurantId);
              const isPizza =
                item.category === 'pizza' ||
                item.name.toLowerCase().includes('pizza') ||
                item.name.toLowerCase().includes('slice');

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Card Image & Badges */}
                  <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Food Type Pill (Top Left) */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                        {isPizza ? '🍕 Pizza' : '🍔 Burger'}
                      </span>
                      {item.dealBadge && (
                        <span className="px-2 py-0.5 rounded-md bg-orange-600 text-white text-[11px] font-bold flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" />
                          <span>{item.dealBadge}</span>
                        </span>
                      )}
                    </div>

                    {/* Verified Rate Badge (Top Right) */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <BadgeCheck className="w-3 h-3" />
                        <span>Verified Rate</span>
                      </span>
                    </div>

                    {/* Size or Type Label (Bottom Left Over Image) */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                      {item.pizzaSize && (
                        <span className="bg-amber-950/80 backdrop-blur-xs px-2 py-0.5 rounded font-medium">
                          {item.pizzaSize === 'monster_slice'
                            ? '20" Monster Slice'
                            : item.pizzaSize === 'medium'
                            ? '12" Medium Pan'
                            : item.pizzaSize === 'large'
                            ? '15" XL Pizza'
                            : item.pizzaSize === 'small'
                            ? '8" Small Pan'
                            : 'Family Feast'}
                        </span>
                      )}
                      {item.burgerType && (
                        <span className="bg-amber-950/80 backdrop-blur-xs px-2 py-0.5 rounded font-medium">
                          {item.burgerType === 'zinger'
                            ? 'Crispy Zinger'
                            : item.burgerType === 'beef'
                            ? 'Prime Beef'
                            : item.burgerType === 'cheese'
                            ? 'Cheddar Melt'
                            : item.burgerType === 'chicken'
                            ? 'Charcoal Grilled'
                            : 'Egg Shami Bun Kabab'}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-mono text-[11px] bg-black/40 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        <span>{item.preparationTimeMin}m</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Restaurant & Location */}
                      {rest && (
                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewRestaurant(rest)}
                            className="font-bold text-amber-800 hover:text-amber-950 hover:underline text-left truncate max-w-[170px]"
                          >
                            {language === 'ur' ? rest.nameUr : rest.name}
                          </button>
                          <span className="text-[11px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 truncate">
                            {rest.neighbourhood}
                          </span>
                        </div>
                      )}

                      {/* Item Name */}
                      <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug line-clamp-1 mb-1">
                        {language === 'ur' ? item.nameUr : item.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-3">
                        {language === 'ur' ? item.descriptionUr : item.description}
                      </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="pt-3 border-t border-neutral-100">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <div className="text-[11px] text-neutral-400 font-medium">Price in PKR</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl sm:text-2xl font-black text-amber-900">
                              Rs. {item.pricePKR}
                            </span>
                            {item.originalPricePKR && (
                              <span className="text-xs text-neutral-400 line-through">
                                Rs. {item.originalPricePKR}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Direct Contact Buttons */}
                        {rest && (
                          <div className="flex items-center gap-1.5">
                            {rest.phone && (
                              <a
                                href={`tel:${rest.phone}`}
                                title={t.callNow}
                                className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {rest.whatsapp && (
                              <a
                                href={`https://wa.me/${rest.whatsapp}?text=${encodeURIComponent(
                                  `Hello, I would like to order: ${item.name} (Rs. ${item.pricePKR}) from your Multan branch.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={t.whatsappOrder}
                                className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: Add / Order & View Menu */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => rest && handleOrderDirect(item, rest)}
                          className="w-full py-2 px-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.addToCart}</span>
                        </button>

                        {rest && (
                          <button
                            type="button"
                            onClick={() => handleViewRestaurant(rest)}
                            className="w-full py-2 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>{t.viewMenu}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================================================================
              EMPTY STATE FOR PRICE FINDER
             ========================================================================= */
          <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 text-2xl">
              🍕🔍
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">
              {t.noItemsFoundTitle}
            </h3>
            <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
              {language === 'ur'
                ? `آپ کے منتخب کردہ بجٹ (Rs. ${minPrice} – Rs. ${maxPrice}) میں اس وقت کوئی پیزا یا برگر نہیں ملا۔ بجٹ رینج بڑھائیں یا تمام علاقے منتخب کریں۔`
                : `No pizzas or burgers currently listed in the Rs. ${minPrice} – Rs. ${maxPrice} range in the selected area. Try adjusting your budget slider or clearing specific filters.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-amber-800 text-white text-xs sm:text-sm font-bold hover:bg-amber-900 transition-colors cursor-pointer shadow-sm"
              >
                {t.resetBudget}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMinPrice(150);
                  setMaxPrice(3500);
                  setSelectedArea('All Areas');
                }}
                className="px-5 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-700 text-xs sm:text-sm font-semibold hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                {language === 'ur' ? 'وسیع رینج (Rs. 150 – Rs. 3500)' : 'Expand Range (Rs. 150 – 3500)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
