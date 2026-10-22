import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { ShoppingBag, Globe, UserCheck, UtensilsCrossed, ShieldAlert, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const {
    language,
    setLanguage,
    role,
    setRole,
    cart,
    view,
    setView,
    setSelectedRestaurantId,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const t = translations[language];
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleNavClick = (targetView: 'explore' | 'track-order' | 'owner-dashboard' | 'admin-dashboard') => {
    setSelectedRestaurantId(null);
    setView(targetView);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('explore')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 group-hover:text-amber-700 transition-colors whitespace-nowrap">
              {language === 'ur' ? (
                <span className="font-urdu text-2xl font-bold text-amber-800">
                  ملتان کے بہترین کھانے
                </span>
              ) : (
                <span>
                  Best Food In <span className="text-amber-700">Multan</span>
                </span>
              )}
            </div>
            <div className="text-[11px] text-neutral-500 font-medium tracking-wide hidden sm:block whitespace-nowrap">
              {language === 'ur' ? 'شہرِ اولیاء کی معروف ترین فوڈ ڈائریکٹری' : 'Bilingual Restaurant Discovery & Direct Orders'}
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-700">
          <button
            onClick={() => handleNavClick('explore')}
            className={`cursor-pointer transition-colors whitespace-nowrap pb-1 ${
              view === 'explore' || view === 'restaurant-detail'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-700'
                : 'hover:text-neutral-950'
            }`}
          >
            {language === 'ur' ? 'ریسٹورنٹس' : 'Discover'}
          </button>

          <button
            onClick={() => handleNavClick('track-order')}
            className={`cursor-pointer transition-colors whitespace-nowrap pb-1 ${
              view === 'track-order'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-700'
                : 'hover:text-neutral-950'
            }`}
          >
            {language === 'ur' ? 'آرڈر ٹریکنگ' : 'Live Order Track'}
          </button>

          <button
            onClick={() => {
              setRole('restaurant_owner');
              handleNavClick('owner-dashboard');
            }}
            className={`cursor-pointer transition-colors whitespace-nowrap pb-1 ${
              view === 'owner-dashboard'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-700'
                : 'hover:text-neutral-950'
            }`}
          >
            {language === 'ur' ? 'ریسٹورنٹ پورٹل' : 'Restaurant Portal'}
          </button>

          <button
            onClick={() => {
              setRole('admin');
              handleNavClick('admin-dashboard');
            }}
            className={`cursor-pointer transition-colors whitespace-nowrap pb-1 ${
              view === 'admin-dashboard'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-700'
                : 'hover:text-neutral-950'
            }`}
          >
            {language === 'ur' ? 'ایڈمن پینل' : 'Admin Panel'}
          </button>

          <button
            onClick={() => {
              handleNavClick('explore');
              setTimeout(() => {
                document.getElementById('pizza-burger-finder')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="cursor-pointer transition-all whitespace-nowrap px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 border border-amber-300 shadow-2xs"
          >
            <span>🍕🍔</span>
            <span>{language === 'ur' ? 'پرائس فائنڈر' : 'Price Finder'}</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Language toggle, Role Switcher, Cart Drawer button) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer whitespace-nowrap"
            title="Switch Language / زبان تبدیل کریں"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-600" />
            <span>{language === 'en' ? 'اردو' : 'English'}</span>
          </button>

          {/* Role selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 hover:border-neutral-400 bg-white text-neutral-800 cursor-pointer whitespace-nowrap transition-colors"
            >
              {role === 'customer' && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
              {role === 'restaurant_owner' && <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />}
              {role === 'admin' && <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />}
              <span className="hidden sm:inline">
                {role === 'customer'
                  ? t.portalCustomer
                  : role === 'restaurant_owner'
                  ? t.portalRestaurant
                  : t.portalAdmin}
              </span>
            </button>

            {roleMenuOpen && (
              <div
                className={`absolute ${
                  language === 'ur' ? 'left-0' : 'right-0'
                } mt-2 w-52 bg-white rounded-xl shadow-lg border border-neutral-200 py-1.5 z-50 text-xs`}
              >
                <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  {t.switchRole}
                </div>
                <button
                  onClick={() => {
                    setRole('customer');
                    setRoleMenuOpen(false);
                    setView('explore');
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-50 cursor-pointer ${
                    role === 'customer' ? 'text-amber-800 font-semibold bg-amber-50/50' : 'text-neutral-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.portalCustomer}</span>
                </button>
                <button
                  onClick={() => {
                    setRole('restaurant_owner');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-50 cursor-pointer ${
                    role === 'restaurant_owner' ? 'text-amber-800 font-semibold bg-amber-50/50' : 'text-neutral-700'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t.portalRestaurant}</span>
                </button>
                <button
                  onClick={() => {
                    setRole('admin');
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-50 cursor-pointer ${
                    role === 'admin' ? 'text-amber-800 font-semibold bg-amber-50/50' : 'text-neutral-700'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{t.portalAdmin}</span>
                </button>
              </div>
            )}
          </div>

          {/* Cart Bag Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{t.cart}</span>
            {cartItemCount > 0 && (
              <span className="px-1.5 py-0.5 text-[11px] font-bold bg-amber-500 text-neutral-950 rounded-md tabular-nums">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
