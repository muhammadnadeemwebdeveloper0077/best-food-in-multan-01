import React from 'react';
import { useApp } from '../context/AppContext';
import { translations, neighbourhoodLabels } from '../utils/translations';
import { MultanNeighbourhood } from '../types';
import { Search, MapPin, Sparkles, Clock, CheckCircle2, Tag } from 'lucide-react';
import heroImage from '../assets/images/hero_multan_food_spread_1792478742378.jpg';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedNeighbourhood: MultanNeighbourhood;
  setSelectedNeighbourhood: (n: MultanNeighbourhood) => void;
}

const POPULAR_AREAS: MultanNeighbourhood[] = [
  'All Areas',
  'Gulgasht Colony',
  'Bosan Road',
  'Multan Cantt',
  'Old City (Ghanta Ghar)',
  'Northern Bypass',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  selectedNeighbourhood,
  setSelectedNeighbourhood,
}) => {
  const { language, restaurants } = useApp();
  const t = translations[language];

  const totalVerified = restaurants.filter(r => r.isVerified).length;

  return (
    <div className="relative overflow-hidden bg-neutral-900 text-white border-b border-neutral-800">
      {/* Background Image with Dark Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Best Multan Pakistani Food Spread"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 scale-105 filter blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/85 to-neutral-900/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          {/* Subtle Multan Heritage Eyebrow (No pill badge) */}
          <div className="flex items-center gap-2 text-xs font-medium text-amber-300 tracking-wider uppercase mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'ur'
                ? 'مدینۃ الاولیاء ملتان کی مستند فوڈ ڈائریکٹری'
                : 'City of Saints & Authentic Culinary Flavours'}
            </span>
            <span aria-hidden="true" className="text-amber-500/60">·</span>
            <span>Multan, Pakistan</span>
          </div>

          {/* Balanced Display Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight [text-wrap:balance]">
            {language === 'ur' ? (
              <span className="font-urdu leading-normal">
                ملتان کے بہترین روایتی و جدید کھانے — آپ کے دروازے پر
              </span>
            ) : (
              <span>
                Discover Multan’s Finest <span className="text-amber-400">Restaurants</span> & Famous Sweetmakers
              </span>
            )}
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 mb-8 max-w-2xl font-normal leading-relaxed">
            {language === 'ur'
              ? 'گھنٹہ گھر کے مشہور حافظ سوہن حلوہ سے لے کر بوسن روڈ کی شنواری کڑاہی اور گلگشت کے کبابوں تک، براہِ راست ریسٹورنٹ ڈلیوری کے ساتھ۔'
              : 'From legendary 1930 Hafiz Sohan Halwa at Ghanta Ghar to sizzling Bosan Road Shinwari Karahi and Gulgasht barbecue.'}
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 text-neutral-900 mb-6">
            <div className="relative flex-1 w-full flex items-center pl-3 pr-2">
              <Search className="w-5 h-5 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full px-3 py-2.5 text-sm sm:text-base text-neutral-900 placeholder-neutral-400 focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-neutral-400 hover:text-neutral-700 px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="w-full sm:w-auto flex items-center border-t sm:border-t-0 sm:border-l border-neutral-200 pt-2 sm:pt-0 sm:pl-3">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mx-1" />
              <select
                value={selectedNeighbourhood}
                onChange={e => setSelectedNeighbourhood(e.target.value as MultanNeighbourhood)}
                className="w-full sm:w-48 py-2.5 px-2 text-xs sm:text-sm font-medium bg-transparent text-neutral-800 focus:outline-none cursor-pointer"
              >
                {Object.keys(neighbourhoodLabels.en).map(key => (
                  <option key={key} value={key} className="text-neutral-900">
                    {neighbourhoodLabels[language][key as MultanNeighbourhood]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Multan Area Filter Chips (Functional Segmented Buttons) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-400 font-medium">{t.filterByArea}:</span>
            {POPULAR_AREAS.map(area => {
              const isSelected = selectedNeighbourhood === area;
              return (
                <button
                  key={area}
                  onClick={() => setSelectedNeighbourhood(area)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-500 text-neutral-950 font-semibold'
                      : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {neighbourhoodLabels[language][area]}
                </button>
              );
            })}
          </div>

          {/* Adjacency Proof Row */}
          <div className="mt-8 pt-6 border-t border-neutral-800/80 flex flex-wrap items-center gap-6 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{totalVerified} Verified Multan Restaurants</span>
            </div>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>25–45 Min Fresh Restaurant-Managed Delivery</span>
            </div>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <div>
              <span>Cash on Delivery (COD) & JazzCash</span>
            </div>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Tag className="w-3.5 h-3.5 text-rose-400" />
              <span>14th Street Pizza Live Deals Updated</span>
            </div>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <a
              href="#pizza-burger-finder"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold transition-all text-xs"
            >
              <span>🍕🍔</span>
              <span>{language === 'ur' ? 'پیزا اور برگر بجٹ سرچ' : 'Pizza & Burger Price Finder'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
