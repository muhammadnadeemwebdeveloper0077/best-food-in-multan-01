import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations, neighbourhoodLabels } from '../utils/translations';
import { MultanNeighbourhood } from '../types';
import { X, CheckCircle2, MapPin, Phone, CreditCard, Banknote, ShieldCheck } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const {
    language,
    cart,
    cartRestaurantId,
    restaurants,
    cartSubtotal,
    cartDeliveryFee,
    cartTotal,
    createOrder,
  } = useApp();

  const t = translations[language];
  const activeRestaurant = restaurants.find(r => r.id === cartRestaurantId);

  const [fullName, setFullName] = useState('Muhammad Nadeem');
  const [phone, setPhone] = useState('0300 1234567');
  const [email, setEmail] = useState('muhammadnadeemwebdeveloper@gmail.com');
  const [neighbourhood, setNeighbourhood] = useState<MultanNeighbourhood>(
    activeRestaurant ? activeRestaurant.neighbourhood : 'Gulgasht Colony'
  );
  const [address, setAddress] = useState('House 18-B, Street 4, near Gol Bagh, Gulgasht Colony');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activeRestaurant) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      createOrder({
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email,
        customerNeighbourhood: neighbourhood,
        customerAddress: address,
        restaurantId: activeRestaurant.id,
        restaurantName: activeRestaurant.name,
        items: [...cart],
        subtotalPKR: cartSubtotal,
        deliveryFeePKR: cartDeliveryFee,
        totalPKR: cartTotal,
        paymentMethod,
        specialInstructions,
        estimatedDeliveryMins: activeRestaurant.deliveryTimeMax || 40,
      });

      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              {t.customerDetails}
            </h3>
            <p className="text-xs text-neutral-500">
              {language === 'ur' ? 'آرڈر براہِ راست ریسٹورنٹ کو بھیجا جا رہا ہے' : `Direct to ${activeRestaurant.name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t.fullName} *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Muhammad Nadeem"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-800 bg-neutral-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t.phone} (WhatsApp) *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-800 bg-neutral-50 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              {t.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-800 bg-neutral-50 focus:bg-white font-mono"
            />
          </div>

          {/* Multan Neighbourhood */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              {t.selectArea} *
            </label>
            <div className="relative">
              <select
                value={neighbourhood}
                onChange={e => setNeighbourhood(e.target.value as MultanNeighbourhood)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-800 bg-neutral-50 focus:bg-white cursor-pointer font-medium"
              >
                {Object.keys(neighbourhoodLabels.en)
                  .filter(k => k !== 'All Areas')
                  .map(key => (
                    <option key={key} value={key}>
                      {neighbourhoodLabels[language][key as MultanNeighbourhood]}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              {t.streetAddress} *
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder={t.streetAddressPlaceholder}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-800 bg-neutral-50 focus:bg-white"
            />
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              {t.specialInstructions}
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              placeholder={t.specialInstructionsPlaceholder}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-800 bg-neutral-50 focus:bg-white"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              {t.paymentMethod}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-amber-800 bg-amber-50 font-semibold text-amber-950 ring-1 ring-amber-800'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{t.cod}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('jazzcash')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'jazzcash'
                    ? 'border-amber-800 bg-amber-50 font-semibold text-amber-950 ring-1 ring-amber-800'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">{t.jazzcash}</span>
              </button>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 space-y-1 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>{t.subtotal} ({cart.length} items)</span>
              <span className="font-mono tabular-nums">₨{cartSubtotal}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>{t.deliveryCharges} ({activeRestaurant.neighbourhood})</span>
              <span className="font-mono tabular-nums">₨{cartDeliveryFee}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-neutral-900 pt-1.5 border-t border-neutral-200">
              <span>{t.total}</span>
              <span className="text-amber-800 font-mono tabular-nums">₨{cartTotal}</span>
            </div>
          </div>

          {/* Direct Restaurant Delivery Notice */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'ur'
                ? 'کھانا ریسٹورنٹ کے اپنے رائڈر کے ذریعے گرم اور محفوظ پہنچایا جاتا ہے۔'
                : 'Direct restaurant delivery ensures fast, fresh preparation and local dispatch.'}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 text-xs sm:text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors cursor-pointer shadow-md disabled:bg-neutral-300"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : (
              <span>{t.confirmOrder} (₨{cartTotal})</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
