import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Sparkles, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, setView, setRole } = useApp();
  const t = translations[language];

  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-neutral-800/80">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-lg font-bold text-white tracking-tight">
              {language === 'ur' ? (
                <span className="font-urdu text-xl text-amber-400">ملتان کے بہترین کھانے</span>
              ) : (
                <span>Best Food In <span className="text-amber-400">Multan</span></span>
              )}
            </div>
            <p className="text-neutral-400 max-w-md leading-relaxed">
              {t.multanHeritageDesc}
            </p>
            <div className="flex items-center gap-2 text-neutral-400 text-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>City of Saints, Punjab, Pakistan (ملتان، پاکستان)</span>
            </div>
          </div>

          {/* Multan Food Heritage */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              {language === 'ur' ? 'ملتان کے روایتی ذائقے' : 'Heritage Cuisines'}
            </h4>
            <ul className="space-y-1.5 text-neutral-400 text-xs">
              <li>Hafiz Multani Sohan Halwa</li>
              <li>Traditional Doli Roti</li>
              <li>Bosan Road Shinwari Karahi</li>
              <li>Gulgasht Charcoal BBQ & Chaamp</li>
              <li>Multani Rabri Falooda</li>
            </ul>
          </div>

          {/* Quick Portals */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              {language === 'ur' ? 'پورٹلز و روابط' : 'Portals & Links'}
            </h4>
            <ul className="space-y-1.5 text-neutral-400 text-xs">
              <li>
                <button
                  onClick={() => {
                    setView('explore');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {language === 'ur' ? 'ریسٹورنٹ ڈائریکٹری' : 'Restaurant Directory'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setRole('restaurant_owner');
                    setView('owner-dashboard');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {language === 'ur' ? 'ریسٹورنٹ اونر لاگ ان' : 'Restaurant Owner Dashboard'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setRole('admin');
                    setView('admin-dashboard');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {language === 'ur' ? 'ایڈمن کنٹرول پینل' : 'Admin & Supabase Settings'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setView('track-order');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {language === 'ur' ? 'لائیو آرڈر ٹریکر' : 'Live Order Tracking'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Quiet Copyright Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-400">
          <div>
            © {new Date().getFullYear()} Best Food In Multan. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-neutral-400">
            <span>Crafted with pride for</span>
            <span className="text-amber-400 font-medium">Multan, Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
