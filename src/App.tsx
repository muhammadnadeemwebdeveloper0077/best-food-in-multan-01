/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryFilter } from './components/CategoryFilter';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantDetailView } from './components/RestaurantDetailView';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SingleRestaurantModal } from './components/SingleRestaurantModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { RestaurantOwnerDashboard } from './components/RestaurantOwnerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PizzaBurgerPriceFinder } from './components/PizzaBurgerPriceFinder';
import { Footer } from './components/Footer';
import { CuisineCategory, MenuItem, MultanNeighbourhood, Restaurant } from './types';
import { translations, categoryLabels, neighbourhoodLabels } from './utils/translations';
import { Sparkles, Utensils, CheckCircle2, Globe, ExternalLink, Tag, Camera } from 'lucide-react';

import sohanHalwaImg from './assets/images/multani_sohan_halwa_box_1792478743436.jpg';
import bbqKarahiImg from './assets/images/multan_sizzling_bbq_karahi_1792478743512.jpg';
import pizzaImg from './assets/images/multan_gourmet_pizza_1792478744000.jpg';

function MainApp() {
  const {
    language,
    view,
    setView,
    restaurants,
    selectedRestaurantId,
    setSelectedRestaurantId,
    forceAddToCartAndClear,
    addToCart,
  } = useApp();

  const t = translations[language];

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<MultanNeighbourhood>('All Areas');
  const [selectedCategory, setSelectedCategory] = useState<CuisineCategory>('all');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Single Restaurant Cart Conflict State
  const [conflictModalData, setConflictModalData] = useState<{
    pendingItem: MenuItem;
    conflictingRestaurant: Restaurant;
  } | null>(null);

  // Selected restaurant object for detail view
  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);

  // Filter restaurants
  const filteredRestaurants = restaurants.filter(r => {
    // Only published in customer directory
    if (!r.isPublished) return false;

    // Search query matching English/Urdu name, cuisines, or address
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q) || r.nameUr.includes(q);
      const matchArea = r.neighbourhood.toLowerCase().includes(q) || r.address.toLowerCase().includes(q);
      const matchCuisine = r.cuisines.some(c => c.toLowerCase().includes(q));
      const matchTagline = r.tagline.toLowerCase().includes(q) || r.taglineUr.includes(q);
      const matchDeal = (r.activeDealBanner && r.activeDealBanner.toLowerCase().includes(q)) || false;
      if (!matchName && !matchArea && !matchCuisine && !matchTagline && !matchDeal) return false;
    }

    // Neighbourhood filter
    if (selectedNeighbourhood !== 'All Areas' && r.neighbourhood !== selectedNeighbourhood) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && !r.cuisines.includes(selectedCategory)) {
      return false;
    }

    return true;
  });

  const handleSelectRestaurant = (r: Restaurant) => {
    setSelectedRestaurantId(r.id);
    setView('restaurant-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConflict = (item: MenuItem, conflictingRestaurant: Restaurant) => {
    setConflictModalData({ pendingItem: item, conflictingRestaurant });
  };

  const handleResolveConflict = () => {
    if (conflictModalData) {
      forceAddToCartAndClear(conflictModalData.pendingItem, 1);
      setConflictModalData(null);
    }
  };

  const handlePriceFinderSelectItem = (item: MenuItem, restaurant: Restaurant) => {
    const result = addToCart(item, 1);
    if (!result.success && result.conflictingRestaurant) {
      handleConflict(item, result.conflictingRestaurant);
    } else {
      setIsCartOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar Contract Compliant Header */}
      <Header onOpenCart={() => setIsCartOpen(true)} />

      {/* Main View Router */}
      <main className="flex-1">
        {view === 'explore' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedNeighbourhood={selectedNeighbourhood}
              setSelectedNeighbourhood={setSelectedNeighbourhood}
            />

            {/* 🍕 Pizza & 🍔 Burger Price Finder (Prominent Top Section) */}
            <PizzaBurgerPriceFinder
              onSelectItem={handlePriceFinderSelectItem}
              onSelectRestaurant={handleSelectRestaurant}
            />

            {/* Category Filter Bar */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Multan Food Heritage Spotlight Row */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
              <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{t.multanHeritage}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                    {language === 'ur'
                      ? 'اصلی ملتانی سوہن حلوہ اور شنواری کڑاہی کا شاہکار ذائقہ'
                      : 'Authentic Multani Sweets & Clay-Tandoor Feasts'}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                    {language === 'ur'
                      ? 'مدینۃ الاولیاء ملتان کا سوہن حلوہ پوری دنیا میں اپنی مثال آپ ہے۔ ہم نے ملتان کے 1930 سے قائم تاریخی کاریگروں اور گلگشت و بوسن روڈ کے معروف کڑاہی باربی کیو ہوٹلوں کو ایک مستند پلیٹ فارم پر یکجا کیا ہے۔'
                      : 'Celebrated across the globe for its caramelized pure desi ghee Sohan Halwa, spiced Doli Roti, and sizzling Shinwari Karahi cooked over high flames. Order directly from authentic Multan kitchens.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Official Brand Web Portals & Verified Live Websites */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 14th Street Pizza Portal Box */}
                <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-amber-500/50 transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          {language === 'ur' ? 'آفیشل ویب سائٹ اور ڈیلز' : 'Official Online Store & Deals'}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono">Bosan Road & Gulgasht</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 flex items-center gap-2">
                      <span>14th Street Pizza Multan</span>
                      <span className="text-xs font-normal text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                        20" Monster Slice
                      </span>
                    </h3>

                    <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
                      {language === 'ur'
                        ? '14thstreetpizza.com کی تمام لائیو ڈیلز، سپر سنڈے 50% رعایت اور دیر رات 3 بجے تک کی ڈلیوری مینو دیکھیں اور براہ راست آرڈر کریں۔'
                        : 'Explore all live deals, 50% Off Super Sunday, Midnight Craving specials and monster slices directly from 14thstreetpizza.com.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-neutral-800">
                    <button
                      onClick={() => {
                        const r = restaurants.find(x => x.id === 'rest-14th-street');
                        if (r) handleSelectRestaurant(r);
                      }}
                      className="flex-1 py-2 px-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
                    >
                      {language === 'ur' ? 'مینو اور ڈیلز دیکھیں' : 'View Multan Menu & Deals'}
                    </button>
                    <a
                      href="https://www.14thstreetpizza.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-700"
                    >
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      <span>14thstreetpizza.com</span>
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </a>
                  </div>
                </div>

                {/* Hafiz Ka Multani Sohan Halwa Portal Box */}
                <div className="bg-amber-950/80 border border-amber-900/80 text-white rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-amber-600/60 transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          {language === 'ur' ? 'آفیشل آن لائن پورٹل — 1930 سے' : 'Official Online Store — Since 1930'}
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-200 font-mono">Hussain Agahi Chowk</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 flex items-center gap-2">
                      <span>{language === 'ur' ? 'حافظ کا ملتانی سوہن حلوہ' : 'Hafiz Ka Multani Sohan Halwa'}</span>
                      <span className="text-xs font-normal text-amber-300 bg-amber-900/80 px-2 py-0.5 rounded border border-amber-700/80">
                        100% Desi Ghee
                      </span>
                    </h3>

                    <p className="text-xs text-amber-100/90 mb-4 leading-relaxed">
                      {language === 'ur'
                        ? 'hafizhalwa.com کا آفیشل مینو، شاہی 4 ان 1 باکس، نیلی مٹی کا روایتی مٹکا اور 1930 کی تاریخی و لائیو تصاویر ملاحظہ کریں۔'
                        : 'Discover pure desi ghee Sohan Halwa, Royal 4-in-1 gift tins, Multani blue pottery matka and complete 1930 to modern picture archives.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-amber-900/70">
                    <button
                      onClick={() => {
                        const r = restaurants.find(x => x.id === 'rest-hafiz-halwa');
                        if (r) handleSelectRestaurant(r);
                      }}
                      className="flex-1 py-2 px-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
                    >
                      {language === 'ur' ? 'مینو اور تاریخی تصاویر' : 'View Menu & Live/Past Pictures'}
                    </button>
                    <a
                      href="https://hafizhalwa.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3.5 bg-amber-900/90 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-amber-700/60"
                    >
                      <Globe className="w-3.5 h-3.5 text-amber-300" />
                      <span>hafizhalwa.com</span>
                      <ExternalLink className="w-3 h-3 text-amber-300/80" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Listings Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
                    {language === 'ur' ? 'ملتان کے ریسٹورنٹس' : 'Restaurants in Multan'}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                    <span>
                      {selectedNeighbourhood === 'All Areas'
                        ? t.allNeighbourhoods
                        : neighbourhoodLabels[language][selectedNeighbourhood]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {selectedCategory === 'all'
                        ? t.allCategories
                        : categoryLabels[language][selectedCategory]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-neutral-800">
                      {filteredRestaurants.length} {language === 'ur' ? 'ریسٹورنٹس دستیاب' : 'listings'}
                    </span>
                  </div>
                </div>

                {/* Reset Filters if applied */}
                {(selectedNeighbourhood !== 'All Areas' || selectedCategory !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedNeighbourhood('All Areas');
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-amber-800 hover:text-amber-950 font-semibold cursor-pointer underline self-start sm:self-center"
                  >
                    {language === 'ur' ? 'فلٹرز ختم کریں' : 'Reset All Filters'}
                  </button>
                )}
              </div>

              {filteredRestaurants.length === 0 ? (
                <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center text-neutral-400">
                  <Utensils className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-neutral-700 mb-1">
                    {language === 'ur' ? 'کوئی ریسٹورنٹ نہیں ملا' : 'No Restaurants Matched Your Search'}
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                    Try clearing the area or cuisine filter to discover more restaurants in Multan.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedNeighbourhood('All Areas');
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    View All Multan Restaurants
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRestaurants.map(restaurant => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      onSelect={handleSelectRestaurant}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Restaurant Menu & Detail View */}
        {view === 'restaurant-detail' && selectedRestaurant && (
          <RestaurantDetailView
            restaurant={selectedRestaurant}
            onBack={() => {
              setSelectedRestaurantId(null);
              setView('explore');
            }}
            onOpenCart={() => setIsCartOpen(true)}
            onConflict={handleConflict}
          />
        )}

        {/* Live Customer Order Tracking */}
        {view === 'track-order' && (
          <OrderTrackingView onExplore={() => setView('explore')} />
        )}

        {/* Restaurant Owner Dashboard */}
        {view === 'owner-dashboard' && <RestaurantOwnerDashboard />}

        {/* Admin Directory Dashboard */}
        {view === 'admin-dashboard' && <AdminDashboard />}
      </main>

      {/* Global Modals & Slide-overs */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      <SingleRestaurantModal
        pendingItem={conflictModalData?.pendingItem || null}
        conflictingRestaurant={conflictModalData?.conflictingRestaurant || null}
        onClose={() => setConflictModalData(null)}
        onClearAndAdd={handleResolveConflict}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
