import React, { useState } from 'react';
import { MenuItem, Restaurant, CuisineCategory } from '../types';
import { useApp } from '../context/AppContext';
import { translations, categoryLabels } from '../utils/translations';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  ExternalLink,
  MessageCircle,
  Phone,
  Plus,
  Minus,
  Sparkles,
  Flame,
  CheckCircle2,
  X,
  Globe,
  Tag,
  History,
  Camera,
  Copy,
  Check,
  Bell,
  Eye,
} from 'lucide-react';

interface RestaurantDetailViewProps {
  restaurant: Restaurant;
  onBack: () => void;
  onOpenCart: () => void;
  onConflict: (item: MenuItem, conflictingRestaurant: Restaurant) => void;
}

export const RestaurantDetailView: React.FC<RestaurantDetailViewProps> = ({
  restaurant,
  onBack,
  onOpenCart,
  onConflict,
}) => {
  const { language, menuItems, addToCart, cart, updateCartQuantity } = useApp();
  const t = translations[language];

  const items = menuItems.filter(item => item.restaurantId === restaurant.id);
  const categories = Array.from(new Set(items.map(i => i.category)));
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Option customization modal state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);

  // Gallery and Stay Updated states
  const [selectedGalleryPeriod, setSelectedGalleryPeriod] = useState<'all' | 'past' | 'live'>('all');
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    caption: string;
    sourceTag?: string;
  } | null>(null);

  const [stayUpdatedContact, setStayUpdatedContact] = useState('');
  const [isStayUpdatedSubmitted, setIsStayUpdatedSubmitted] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleStayUpdatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stayUpdatedContact.trim()) {
      setIsStayUpdatedSubmitted(true);
      setTimeout(() => {
        setStayUpdatedContact('');
      }, 4000);
    }
  };

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(i => i.category === activeCategory);

  const handleAddItem = (item: MenuItem) => {
    if (item.options && item.options.length > 0) {
      setCustomizingItem(item);
      setSelectedOptionIndex(0);
      return;
    }

    const result = addToCart(item, 1);
    if (!result.success && result.conflictingRestaurant) {
      onConflict(item, result.conflictingRestaurant);
    }
  };

  const handleConfirmCustomizedAdd = () => {
    if (!customizingItem) return;
    const opt = customizingItem.options![0];
    const choice = opt.choices[selectedOptionIndex];

    const result = addToCart(
      customizingItem,
      1,
      { [opt.name]: choice.label },
      choice.priceDelta
    );

    setCustomizingItem(null);
    if (!result.success && result.conflictingRestaurant) {
      onConflict(customizingItem, result.conflictingRestaurant);
    }
  };

  const getItemCartQuantity = (itemId: string) => {
    return cart
      .filter(ci => ci.menuItem.id === itemId)
      .reduce((sum, ci) => sum + ci.quantity, 0);
  };

  return (
    <div className="bg-neutral-50 min-h-screen pb-24">
      {/* Top Banner and Navigation Bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToRestaurants}</span>
          </button>
        </div>
      </div>

      {/* Restaurant Header Hero */}
      <div className="relative bg-neutral-900 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/80 to-neutral-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-4xl">
            {/* Metadata row */}
            <div className="flex items-center gap-3 text-xs text-neutral-300 mb-3 font-medium">
              <span className="text-amber-400 font-semibold">{restaurant.neighbourhood}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-white">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="tabular-nums font-semibold">{restaurant.rating}</span>
                <span className="text-neutral-400">({restaurant.reviewCount} {language === 'ur' ? 'آراء' : 'reviews'})</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-neutral-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="tabular-nums">
                  {restaurant.deliveryTimeMin}–{restaurant.deliveryTimeMax} {language === 'ur' ? 'منٹ' : 'mins'}
                </span>
              </span>
              {restaurant.isVerified && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.verified}</span>
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white">
              {language === 'ur' ? restaurant.nameUr : restaurant.name}
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 mb-4 max-w-2xl leading-relaxed">
              {language === 'ur' ? restaurant.taglineUr : restaurant.tagline}
            </p>

            <div className="flex items-center gap-2 text-xs text-neutral-300 mb-6">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{language === 'ur' ? restaurant.addressUr : restaurant.address}</span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {restaurant.websiteUrl && (
                <a
                  href={restaurant.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg font-bold transition-colors shadow-xs"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{t.website}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}

              <a
                href={restaurant.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t.mapsLocation}</span>
              </a>

              <a
                href={`tel:${restaurant.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{restaurant.phone}</span>
              </a>

              <a
                href={`https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(
                  `Salam! I am viewing your menu on Best Food In Multan.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{t.whatsappOrder}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Categories Tab Bar */}
      <div className="sticky top-18 z-30 bg-white border-b border-neutral-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none no-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-amber-800 text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              {language === 'ur' ? 'مکمل مینو' : 'All Dishes'} ({items.length})
            </button>
            {categories.map(cat => {
              const label = categoryLabels[language][cat as CuisineCategory] || cat;
              const count = items.filter(i => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-amber-800 text-white'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live Deals & Stay Updated Banner (e.g. for 14th Street Pizza) */}
        {restaurant.activeDealBanner && (
          <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-neutral-900 text-white p-4 sm:p-5 rounded-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-amber-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {language === 'ur' ? 'لائیو آفرز اور ڈیلز' : 'Live Deals & Online Specials'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs sm:text-sm text-neutral-200 mt-0.5">
                  {language === 'ur' ? restaurant.activeDealBannerUr : restaurant.activeDealBanner}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto shrink-0">
              {restaurant.liveDealsUrl && (
                <a
                  href={restaurant.liveDealsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>{language === 'ur' ? 'ویب سائٹ پر لائیو ڈیلز دیکھیں' : 'View Deals on Official Site'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {restaurant.websiteUrl && (
                <a
                  href={restaurant.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'آفیشل ویب سائٹ' : 'Official Site'}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* 14th Street Pizza - Stay Updated & Online Deals Card */}
        {restaurant.id === 'rest-14th-street' && (
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-md mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  <Bell className="w-4 h-4 animate-bounce" />
                  <span>{language === 'ur' ? 'سٹے اپڈیٹڈ — 14th Street Pizza ڈیلز' : 'Stay Updated — 14th Street Pizza Deals'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                  {language === 'ur' ? 'تازہ ترین لائیو مینیو اور بچت ڈیلز سے باخبر رہیں' : 'Get Real-Time Value Deals & Midnight Specials'}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {language === 'ur'
                    ? '14thstreetpizza.com پر جاری سپر سنڈے 50% رعایت، 20 انچ مونسٹر سلائس کمبوز اور مڈ نائٹ ڈیلیوری کی تمام اپڈیٹس فوری حاصل کریں۔'
                    : 'Directly synchronized with 14thstreetpizza.com — browse Super Sunday 50% Off 2nd Pizza, Midnight Craving combos, and 20" Monster Slice deals.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://www.14thstreetpizza.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-transform hover:scale-[1.02] shadow-sm"
                >
                  <Globe className="w-4 h-4" />
                  <span>14thstreetpizza.com</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://www.14thstreetpizza.com/deals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center gap-2 transition-colors border border-neutral-700"
                >
                  <Tag className="w-4 h-4 text-rose-400" />
                  <span>{language === 'ur' ? 'آفیشل ویب سائٹ ڈیلز' : 'View Deals on Website'}</span>
                </a>
              </div>
            </div>

            {/* Exclusive Promo Codes Row & Stay Updated Subscribe Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="bg-neutral-900/90 rounded-2xl p-4 border border-neutral-800">
                <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
                  Active Voucher Code
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-base font-bold text-white tracking-widest">MULTAN14</span>
                    <span className="text-[11px] text-neutral-400 block">15% Off on 15" XL Pizzas</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode('MULTAN14')}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg cursor-pointer transition-colors"
                    title="Copy code"
                  >
                    {copiedCode === 'MULTAN14' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-neutral-900/90 rounded-2xl p-4 border border-neutral-800">
                <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-1">
                  Midnight Promo Code
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-base font-bold text-white tracking-widest">MIDNIGHT14</span>
                    <span className="text-[11px] text-neutral-400 block">Free 1.5L Drink (11 PM - 3 AM)</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode('MIDNIGHT14')}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg cursor-pointer transition-colors"
                    title="Copy code"
                  >
                    {copiedCode === 'MIDNIGHT14' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Stay Updated Email/Phone Subscribe Box */}
              <div className="bg-neutral-900/90 rounded-2xl p-4 border border-neutral-800">
                <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                  Stay Updated Alerts
                </div>
                {isStayUpdatedSubmitted ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 py-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{language === 'ur' ? 'آپ 14th Street ڈیلز کے لیے سبسکرائب ہو چکے ہیں!' : 'Subscribed! You will receive verified deal alerts.'}</span>
                  </div>
                ) : (
                  <form onSubmit={handleStayUpdatedSubmit} className="flex gap-1.5 mt-1">
                    <input
                      type="text"
                      placeholder={language === 'ur' ? 'موبائل نمبر یا ای میل' : 'WhatsApp number / Email'}
                      value={stayUpdatedContact}
                      onChange={e => setStayUpdatedContact(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      {language === 'ur' ? 'شامل ہوں' : 'Join'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Heritage Story: Past Picture (1930) vs Live Modern Showroom */}
        {restaurant.pastStory && (
          <div className="bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs mb-10">
            <div className="p-6 sm:p-8 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                <History className="w-4 h-4" />
                <span>
                  {language === 'ur'
                    ? `تاریخی ورثہ — 1930 سے آج تک (${restaurant.pastStory.establishedYear})`
                    : `Historic Heritage Since ${restaurant.pastStory.establishedYear}`}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
                {language === 'ur' ? 'ماضی کی روایات سے جدید ترین شوروم تک' : 'The Century-Old Sweet Legacy of Multan'}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl">
                {language === 'ur' ? restaurant.pastStory.storyUr : restaurant.pastStory.storyEn}
              </p>
              <div className="mt-3 text-xs font-semibold text-amber-900">
                {language === 'ur' ? restaurant.pastStory.founderUr : restaurant.pastStory.founder}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
              {/* Past Picture */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md">
                      {language === 'ur' ? 'ماضی کی تاریخی تصویر (1930)' : 'Past: 1930 Historic Archive'}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      Hussain Agahi Bazaar, Multan
                    </span>
                  </div>
                  <div
                    onClick={() =>
                      setLightboxImage({
                        url: restaurant.pastStory!.vintageImageUrl,
                        title: language === 'ur' ? 'ماضی کی تاریخی تصویر (1930)' : '1930 Historic Archive Kitchen',
                        caption: language === 'ur' ? 'پرانے ملتان میں لکڑیوں پر تانبے کی دیگ میں سوہن حلوہ کی روایتی تیاری۔' : 'Simmering authentic Sohan Halwa in copper cauldrons over firewood near Ghanta Ghar in 1930.',
                        sourceTag: 'hafizhalwa.com Historic Archive',
                      })
                    }
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 mb-3 shadow-inner cursor-pointer group"
                  >
                    <img
                      src={restaurant.pastStory.vintageImageUrl}
                      alt="Hafiz Sohan Halwa 1930 Vintage History"
                      className="w-full h-full object-cover sepia-[0.35] contrast-105 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{language === 'ur' ? 'بڑی تصویر دیکھیں' : 'Click to Enlarge'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 leading-snug">
                    {language === 'ur'
                      ? 'پرانے ملتان کے بازار میں گھنٹہ گھر کے سائے تلے تانبے کی دیگوں میں خالص دیسی گھی اور سامنک سے تیار ہونے والا اصل سوہن حلوہ۔'
                      : 'Authentic 1930s archive showing master confectioners simmering thick Sohan Halwa in copper cauldrons over firewood near the Ghanta Ghar clock tower.'}
                  </p>
                </div>
              </div>

              {/* Live Modern Picture */}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md">
                      {language === 'ur' ? 'موجودہ جدید تصویر (Live Showroom)' : 'Live: Modern Showroom & Gold Tins'}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      hafizhalwa.com Store
                    </span>
                  </div>
                  <div
                    onClick={() =>
                      setLightboxImage({
                        url: restaurant.pastStory!.modernImageUrl,
                        title: language === 'ur' ? 'موجودہ جدید تصویر (Live Showroom)' : 'Live Modern Showroom & Embossed Gold Tins',
                        caption: language === 'ur' ? 'شاہی گولڈن ٹن اور لگژری مخملی ڈبوں میں محفوظ، بادام و پستے سے بھرپور تازہ سوہن حلوہ۔' : 'Modern signature embossed royal golden tins and luxury velvet gift boxes ready for worldwide courier.',
                        sourceTag: 'hafizhalwa.com Official Store',
                      })
                    }
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 mb-3 shadow-inner cursor-pointer group"
                  >
                    <img
                      src={restaurant.pastStory.modernImageUrl}
                      alt="Hafiz Sohan Halwa Modern Presentation"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{language === 'ur' ? 'بڑی تصویر دیکھیں' : 'Click to Enlarge'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 leading-snug">
                    {language === 'ur'
                      ? 'شاہی گولڈن ٹن اور لگژری مخملی ڈبوں میں محفوظ، بادام و پستے سے بھرپور تازہ سوہن حلوہ، دنیا بھر میں ترسیل کے لیے تیار۔'
                      : 'Modern signature embossed royal golden tins and luxury velvet gift boxes, freshly garnished with roasted almonds and pistachios for delivery.'}
                  </p>
                </div>

                {restaurant.websiteUrl && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">
                      Official website:
                    </span>
                    <a
                      href={restaurant.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <span>hafizhalwa.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Live and Past Picture Gallery (Same that is given in official website) */}
        {restaurant.gallery && restaurant.gallery.length > 0 && (
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                  <Camera className="w-4 h-4" />
                  <span>
                    {language === 'ur'
                      ? 'تصاویر کی باقاعدہ گیلری (Live & Past Pictures)'
                      : 'Live & Past Picture Gallery (Official Archive)'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {language === 'ur'
                    ? `${restaurant.nameUr} کی لائیو اور ماضی کی تصویری جھلکیاں`
                    : `Official Live and Past Pictures from ${restaurant.websiteUrl ? new URL(restaurant.websiteUrl).hostname : restaurant.name}`}
                </h3>
              </div>

              {/* Gallery Filter Tabs: All / Past / Live */}
              <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setSelectedGalleryPeriod('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    selectedGalleryPeriod === 'all'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {language === 'ur' ? 'تمام تصاویر' : 'All Photos'} ({restaurant.gallery.length})
                </button>
                <button
                  onClick={() => setSelectedGalleryPeriod('past')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    selectedGalleryPeriod === 'past'
                      ? 'bg-amber-100 text-amber-900 shadow-xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {language === 'ur' ? 'ماضی کا ورثہ (Past)' : 'Past Heritage'} ({restaurant.gallery.filter(g => g.period === 'past').length})
                </button>
                <button
                  onClick={() => setSelectedGalleryPeriod('live')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    selectedGalleryPeriod === 'live'
                      ? 'bg-emerald-100 text-emerald-900 shadow-xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {language === 'ur' ? 'موجودہ جدید (Live)' : 'Live Today'} ({restaurant.gallery.filter(g => g.period === 'live').length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {restaurant.gallery
                .filter(item => selectedGalleryPeriod === 'all' || item.period === selectedGalleryPeriod)
                .map(photo => (
                  <div
                    key={photo.id}
                    onClick={() =>
                      setLightboxImage({
                        url: photo.imageUrl,
                        title: language === 'ur' ? photo.titleUr : photo.title,
                        caption: language === 'ur' ? photo.captionUr : photo.caption,
                        sourceTag: photo.sourceTag,
                      })
                    }
                    className="group bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
                        <img
                          src={photo.imageUrl}
                          alt={language === 'ur' ? photo.titleUr : photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              photo.period === 'past'
                                ? 'bg-amber-900/90 text-amber-200'
                                : 'bg-emerald-800/90 text-emerald-100'
                            }`}
                          >
                            {photo.period === 'past' ? (language === 'ur' ? 'ماضی (1930)' : 'Past Archive') : (language === 'ur' ? 'لائیو (موجودہ)' : 'Live Today')}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{language === 'ur' ? 'بڑی تصویر' : 'View'}</span>
                        </div>
                      </div>

                      <div className="p-3.5">
                        <h4 className="text-xs font-bold text-neutral-900 line-clamp-1 mb-1">
                          {language === 'ur' ? photo.titleUr : photo.title}
                        </h4>
                        <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed">
                          {language === 'ur' ? photo.captionUr : photo.caption}
                        </p>
                      </div>
                    </div>

                    {photo.sourceTag && (
                      <div className="px-3.5 py-2 border-t border-neutral-200/60 text-[10px] text-neutral-500 font-medium flex items-center justify-between">
                        <span>{photo.sourceTag}</span>
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const inCartQty = getItemCartQuantity(item.id);
            const cartEntry = cart.find(ci => ci.menuItem.id === item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-colors"
              >
                <div>
                  {/* Dish Image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
                    <img
                      src={item.image}
                      alt={language === 'ur' ? item.nameUr : item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                      {item.dealBadge && (
                        <div className="bg-rose-600 text-white px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 shadow-xs">
                          <Tag className="w-3 h-3" />
                          <span>{item.dealBadge}</span>
                        </div>
                      )}
                      {item.isSpeciality && (
                        <div className="bg-amber-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{language === 'ur' ? 'خاص ڈش' : 'Multan Special'}</span>
                        </div>
                      )}
                      {item.isSpicy && (
                        <div className="bg-rose-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          <span>{language === 'ur' ? 'تیکھا' : 'Spicy'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className="text-base font-bold text-neutral-900 line-clamp-1">
                        {language === 'ur' ? item.nameUr : item.name}
                      </h3>
                      <div className="text-right shrink-0">
                        {item.originalPricePKR && (
                          <span className="text-[11px] text-neutral-400 line-through tabular-nums font-mono block leading-none">
                            ₨{item.originalPricePKR}
                          </span>
                        )}
                        <span className="text-base font-extrabold text-amber-800 tabular-nums font-mono">
                          ₨{item.pricePKR}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 mb-4">
                      {language === 'ur' ? item.descriptionUr : item.description}
                    </p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-4 sm:p-5 pt-0 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {item.preparationTimeMin} {language === 'ur' ? 'منٹ میں تیار' : 'mins prep'}
                  </span>

                  {inCartQty > 0 ? (
                    <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
                      <button
                        onClick={() => {
                          if (cartEntry) {
                            updateCartQuantity(cartEntry.cartItemId, -1);
                          }
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-neutral-800 shadow-xs hover:bg-neutral-200 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold tabular-nums">
                        {inCartQty}
                      </span>
                      <button
                        onClick={() => handleAddItem(item)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-amber-800 text-white shadow-xs hover:bg-amber-900 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddItem(item)}
                      disabled={!item.isAvailable}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                        item.isAvailable
                          ? 'bg-amber-800 hover:bg-amber-900 text-white shadow-xs'
                          : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{item.isAvailable ? t.addToCart : t.outOfStock}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Cart Bar (if items in cart) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40">
          <div className="bg-neutral-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-neutral-800">
            <div>
              <div className="text-xs text-neutral-400">
                {cart.reduce((s, i) => s + i.quantity, 0)} {language === 'ur' ? 'کھانے شامل' : 'items in order'}
              </div>
              <div className="text-base font-extrabold text-amber-400 tabular-nums font-mono">
                ₨{cart.reduce((s, i) => s + i.itemTotal, 0)}
              </div>
            </div>
            <button
              onClick={onOpenCart}
              className="px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              {t.checkout}
            </button>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {customizingItem && customizingItem.options && customizingItem.options.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
              <div>
                <h4 className="font-bold text-base text-neutral-900">
                  {language === 'ur' ? customizingItem.nameUr : customizingItem.name}
                </h4>
                <p className="text-xs text-neutral-500">{t.customise}</p>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold text-neutral-700 block mb-2">
                {language === 'ur' && customizingItem.options[0].nameUr
                  ? customizingItem.options[0].nameUr
                  : customizingItem.options[0].name}
              </label>
              <div className="space-y-2">
                {customizingItem.options[0].choices.map((choice, idx) => (
                  <button
                    key={choice.label}
                    onClick={() => setSelectedOptionIndex(idx)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs cursor-pointer transition-all ${
                      selectedOptionIndex === idx
                        ? 'border-amber-800 bg-amber-50 text-amber-900 font-semibold ring-1 ring-amber-800'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-800'
                    }`}
                  >
                    <span>{language === 'ur' && choice.labelUr ? choice.labelUr : choice.label}</span>
                    <span className="font-mono tabular-nums text-neutral-600">
                      {choice.priceDelta > 0 ? `+₨${choice.priceDelta}` : 'Free'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCustomizingItem(null)}
                className="flex-1 py-2.5 text-xs font-medium border border-neutral-300 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer text-neutral-700"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmCustomizedAdd}
                className="flex-1 py-2.5 text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white rounded-xl transition-colors cursor-pointer"
              >
                {t.addToCart} (₨{customizingItem.pricePKR + customizingItem.options[0].choices[selectedOptionIndex].priceDelta})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Live and Past Pictures */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {lightboxImage.title}
                </h3>
                {lightboxImage.sourceTag && (
                  <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-1 rounded-md shrink-0">
                    {lightboxImage.sourceTag}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4">
                {lightboxImage.caption}
              </p>
              {restaurant.websiteUrl && (
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">
                    Official website:
                  </span>
                  <a
                    href={restaurant.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5"
                  >
                    <span>{restaurant.websiteUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
