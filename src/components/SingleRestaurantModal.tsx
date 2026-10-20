import React from 'react';
import { MenuItem, Restaurant } from '../types';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { AlertCircle, ShoppingBag, X } from 'lucide-react';

interface SingleRestaurantModalProps {
  pendingItem: MenuItem | null;
  conflictingRestaurant: Restaurant | null;
  onClose: () => void;
  onClearAndAdd: () => void;
}

export const SingleRestaurantModal: React.FC<SingleRestaurantModalProps> = ({
  pendingItem,
  conflictingRestaurant,
  onClose,
  onClearAndAdd,
}) => {
  const { language } = useApp();
  const t = translations[language];

  if (!pendingItem || !conflictingRestaurant) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-base font-bold text-neutral-900 mb-2">
          {language === 'ur'
            ? 'آرڈر صرف ایک ریسٹورنٹ سے ممکن ہے'
            : 'Order from One Restaurant at a Time'}
        </h3>

        <p className="text-xs text-neutral-600 leading-relaxed mb-4">
          {language === 'ur' ? (
            <>
              آپ کی باسکٹ میں پہلے سے <strong className="text-neutral-900">{conflictingRestaurant.nameUr}</strong> کے کھانے موجود ہیں۔ چونکہ ہر ریسٹورنٹ اپنی ڈلیوری خود سنبھالتا ہے، آپ ایک وقت میں صرف ایک ہی جگہ سے آرڈر کر سکتے ہیں۔
            </>
          ) : (
            <>
              Your cart currently contains items from <strong className="text-neutral-900">{conflictingRestaurant.name}</strong>. Because each restaurant manages its own kitchen and rider delivery, you can only order from one restaurant per checkout.
            </>
          )}
        </p>

        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 mb-6 flex items-center gap-3">
          <ShoppingBag className="w-4 h-4 text-neutral-400 shrink-0" />
          <div className="text-xs text-neutral-700">
            {language === 'ur'
              ? `باسکٹ خالی کر کے ${pendingItem.nameUr} شامل کریں؟`
              : `Clear existing cart and add "${pendingItem.name}"?`}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer border border-neutral-300"
          >
            {t.cancel}
          </button>
          <button
            onClick={onClearAndAdd}
            className="flex-1 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            {t.clearCartAndSwitch}
          </button>
        </div>
      </div>
    </div>
  );
};
