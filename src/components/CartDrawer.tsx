import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const {
    language,
    cart,
    cartRestaurantId,
    restaurants,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDeliveryFee,
    cartTotal,
  } = useApp();

  const t = translations[language];
  const activeRestaurant = restaurants.find(r => r.id === cartRestaurantId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div
        className={`fixed inset-y-0 ${
          language === 'ur' ? 'left-0' : 'right-0'
        } max-w-full flex pl-10`}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-800" />
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                {t.cart} ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Restaurant Banner if items present */}
          {activeRestaurant && (
            <div className="bg-amber-50/70 px-4 sm:px-6 py-2.5 border-b border-amber-200/50 flex items-center justify-between text-xs">
              <div>
                <span className="text-neutral-500 font-medium">
                  {language === 'ur' ? 'آرڈر بذریعہ:' : 'Ordering from:'}
                </span>{' '}
                <strong className="text-neutral-900 font-semibold">
                  {language === 'ur' ? activeRestaurant.nameUr : activeRestaurant.name}
                </strong>
              </div>
              <button
                onClick={clearCart}
                className="text-neutral-500 hover:text-rose-600 font-medium cursor-pointer"
                title="Clear Cart"
              >
                {language === 'ur' ? 'خالی کریں' : 'Clear'}
              </button>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mb-3" />
                <h3 className="text-base font-bold text-neutral-700 mb-1">{t.cartEmpty}</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  {t.cartEmptyDesc}
                </p>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.cartItemId}
                  className="flex gap-3 pb-4 border-b border-neutral-100 items-start justify-between"
                >
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-neutral-100"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                      {language === 'ur' ? item.menuItem.nameUr : item.menuItem.name}
                    </h4>

                    {item.selectedOptions && (
                      <div className="text-[11px] text-amber-800 font-medium truncate">
                        {Object.values(item.selectedOptions).join(', ')}
                      </div>
                    )}

                    <div className="text-xs text-neutral-500 mt-0.5 tabular-nums font-mono">
                      ₨{item.menuItem.pricePKR + item.selectedOptionsPriceDelta} × {item.quantity}
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5 bg-neutral-100 rounded-md p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.cartItemId, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-white text-neutral-700 hover:bg-neutral-200 cursor-pointer shadow-2xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.cartItemId, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-amber-800 text-white hover:bg-amber-900 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-neutral-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-neutral-900 tabular-nums font-mono">
                      ₨{item.itemTotal}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Calculations */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-neutral-200 bg-neutral-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>{t.subtotal}</span>
                  <span className="font-mono tabular-nums font-medium">₨{cartSubtotal}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>{t.deliveryCharges}</span>
                  <span className="font-mono tabular-nums font-medium">₨{cartDeliveryFee}</span>
                </div>
                <div className="flex items-center justify-between text-sm sm:text-base font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>{t.total}</span>
                  <span className="text-amber-800 font-mono tabular-nums">₨{cartTotal}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full py-3 px-4 text-xs sm:text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{t.checkout}</span>
                {language === 'ur' ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
