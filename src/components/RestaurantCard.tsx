import React from 'react';
import { Restaurant } from '../types';
import { useApp } from '../context/AppContext';
import { translations, neighbourhoodLabels, categoryLabels } from '../utils/translations';
import { Star, Clock, MapPin, ExternalLink, MessageCircle, CheckCircle2, Globe, Tag } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: (restaurant: Restaurant) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onSelect }) => {
  const { language } = useApp();
  const t = translations[language];

  const primaryCuisine = restaurant.cuisines[0] || 'desi';
  const cuisineName = categoryLabels[language][primaryCuisine] || primaryCuisine;
  const areaName = neighbourhoodLabels[language][restaurant.neighbourhood] || restaurant.neighbourhood;

  return (
    <div className="group bg-white rounded-2xl border border-neutral-200/80 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
          <img
            src={restaurant.coverImage}
            alt={language === 'ur' ? restaurant.nameUr : restaurant.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Clean Top Status Indicators */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs text-white">
            {restaurant.isVerified && (
              <div className="flex items-center gap-1 bg-neutral-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.verified}</span>
              </div>
            )}
            <div className="ml-auto bg-neutral-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1 text-amber-300 font-semibold tabular-nums">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{restaurant.rating}</span>
              <span className="text-neutral-400 font-normal">({restaurant.reviewCount})</span>
            </div>
          </div>

          {/* Quick info over photo bottom */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-neutral-200">
            <span className="font-medium text-white flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="tabular-nums">
                {restaurant.deliveryTimeMin}–{restaurant.deliveryTimeMax} {language === 'ur' ? 'منٹ' : 'mins'}
              </span>
            </span>
            <span className="tabular-nums font-medium text-amber-300">
              {language === 'ur' ? `ڈلیوری ₨${restaurant.deliveryFeePKR}` : `₨${restaurant.deliveryFeePKR} Delivery`}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          {/* Unboxed Metadata (Zero-Pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5 font-medium">
            <span className="text-amber-800">{areaName}</span>
            <span aria-hidden="true">·</span>
            <span>{cuisineName}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono text-neutral-600">
              Min ₨{restaurant.minOrderPKR}
            </span>
          </div>

          {/* Restaurant Title */}
          <h3 className="text-lg font-bold text-neutral-950 group-hover:text-amber-800 transition-colors line-clamp-1 mb-1">
            {language === 'ur' ? restaurant.nameUr : restaurant.name}
          </h3>

          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-3">
            {language === 'ur' ? restaurant.taglineUr : restaurant.tagline}
          </p>

          {restaurant.activeDealBanner && (
            <div className="flex items-center gap-1.5 text-[11px] text-rose-700 font-semibold mb-2 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
              <Tag className="w-3 h-3 shrink-0 text-rose-600" />
              <span className="truncate">
                {language === 'ur' ? 'لائیو آفرز دستیاب ہیں' : 'Live Deals Active (14thstreetpizza.com)'}
              </span>
            </div>
          )}

          {/* Multan Address snippet */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="truncate">{language === 'ur' ? restaurant.addressUr : restaurant.address}</span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 sm:p-5 pt-0 border-t border-neutral-100 flex items-center gap-2">
        <button
          onClick={() => onSelect(restaurant)}
          className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors cursor-pointer text-center"
        >
          {t.viewMenu}
        </button>

        {/* Direct Google Maps link */}
        <a
          href={restaurant.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={t.mapsLocation}
          className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Official Website link if present */}
        {restaurant.websiteUrl && (
          <a
            href={restaurant.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`${restaurant.name} - ${t.website}`}
            className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors"
          >
            <Globe className="w-4 h-4" />
          </a>
        )}

        {/* Direct WhatsApp link */}
        <a
          href={`https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(
            `Salam ${restaurant.name}, I am exploring your menu on Best Food In Multan.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          title={t.whatsappOrder}
          className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
