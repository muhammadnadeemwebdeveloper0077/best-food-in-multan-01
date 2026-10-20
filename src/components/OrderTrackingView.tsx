import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations, statusLabels, neighbourhoodLabels } from '../utils/translations';
import { OrderStatus } from '../types';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Bike,
  PackageCheck,
  MessageCircle,
  Phone,
  MapPin,
  ChevronRight,
  ArrowLeft,
  XCircle,
} from 'lucide-react';

const STATUS_STEPS: { key: OrderStatus; labelEn: string; labelUr: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'pending', labelEn: 'Order Received', labelUr: 'آرڈر موصول ہو گیا', icon: Clock },
  { key: 'confirmed', labelEn: 'Restaurant Confirmed', labelUr: 'ریسٹورنٹ نے قبول کیا', icon: CheckCircle2 },
  { key: 'preparing', labelEn: 'In Kitchen / Tandoor', labelUr: 'تندور و باورچی خانے میں تیار', icon: ChefHat },
  { key: 'out_for_delivery', labelEn: 'Rider Out for Delivery', labelUr: 'رائڈر روانہ ہو چکا ہے', icon: Bike },
  { key: 'delivered', labelEn: 'Delivered', labelUr: 'کھانا پہنچ چکا ہے', icon: PackageCheck },
];

export const OrderTrackingView: React.FC<{ onExplore: () => void }> = ({ onExplore }) => {
  const {
    language,
    orders,
    activeOrderId,
    setActiveOrderId,
    restaurants,
  } = useApp();

  const t = translations[language];

  const currentOrder = orders.find(o => o.id === activeOrderId) || orders[0];
  const orderRestaurant = currentOrder
    ? restaurants.find(r => r.id === currentOrder.restaurantId)
    : null;

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'preparing': return 2;
      case 'out_for_delivery': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentStep = currentOrder ? getStepIndex(currentOrder.status) : 0;

  if (!currentOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <PackageCheck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-neutral-800 mb-2">No Active Orders Found</h2>
        <p className="text-xs text-neutral-500 mb-6">
          You haven’t placed any orders yet. Explore Multan’s restaurants and order your favorite meal.
        </p>
        <button
          onClick={onExplore}
          className="px-5 py-2.5 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900 transition-colors cursor-pointer"
        >
          {t.backToRestaurants}
        </button>
      </div>
    );
  }

  // Pre-formatted WhatsApp text
  const itemsSummary = currentOrder.items
    .map(i => `${i.quantity}x ${i.menuItem.name}`)
    .join(', ');

  const whatsappMessage = encodeURIComponent(
    `Salam! Regarding my order ${currentOrder.id} at ${currentOrder.restaurantName}:\n` +
    `Items: ${itemsSummary}\n` +
    `Total: PKR ${currentOrder.totalPKR}\n` +
    `Delivery to: ${currentOrder.customerAddress}, ${currentOrder.customerNeighbourhood}\n` +
    `Please share live status.`
  );

  const restaurantWhatsApp = orderRestaurant?.whatsapp || '923001234567';

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToRestaurants}</span>
          </button>

          {/* Switch between past orders if any */}
          {orders.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">{language === 'ur' ? 'آرڈرز:' : 'Recent Orders:'}</span>
              <select
                value={currentOrder.id}
                onChange={e => setActiveOrderId(e.target.value)}
                className="bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-xs font-mono font-medium focus:outline-none cursor-pointer"
              >
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.id} ({statusLabels[language][o.status]})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Live Status Card */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold mb-1">
                <span>{t.orderId}:</span>
                <span className="font-mono text-neutral-900 tabular-nums">{currentOrder.id}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                {currentOrder.restaurantName}
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                {language === 'ur' ? 'آرڈر کا وقت:' : 'Placed on:'}{' '}
                {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${restaurantWhatsApp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.whatsappDirectChat}</span>
              </a>

              {orderRestaurant && (
                <a
                  href={`tel:${orderRestaurant.phone}`}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{orderRestaurant.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="py-8">
            {currentOrder.status === 'cancelled' ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-800 text-xs font-semibold">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>{t.cancelled} — The restaurant was unable to fulfill this order.</span>
              </div>
            ) : (
              <div className="relative">
                {/* Horizontal Progress Track for desktop */}
                <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-neutral-100 -translate-y-1/2 z-0" />
                <div
                  className="hidden sm:block absolute top-1/2 left-0 h-1 bg-amber-600 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: `${(Math.max(0, currentStep) / (STATUS_STEPS.length - 1)) * 100}%` }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.key}
                        className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isCurrent
                              ? 'bg-amber-800 text-white ring-4 ring-amber-100'
                              : isDone
                              ? 'bg-amber-600 text-white'
                              : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isCurrent ? 'text-amber-900' : isDone ? 'text-neutral-900' : 'text-neutral-400'
                            }`}
                          >
                            {language === 'ur' ? step.labelUr : step.labelEn}
                          </p>
                          {isCurrent && (
                            <span className="text-[11px] text-amber-700 font-medium">
                              {language === 'ur' ? 'جاری ہے' : 'In Progress'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Delivery Estimate Box */}
          {currentOrder.status !== 'delivered' && currentOrder.status !== 'cancelled' && (
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-700">
                <Clock className="w-4 h-4 text-amber-800 shrink-0" />
                <span>
                  {language === 'ur' ? 'متوقع ڈلیوری وقت:' : 'Estimated delivery time:'}{' '}
                  <strong className="text-neutral-950 font-bold">{currentOrder.estimatedDeliveryMins} mins</strong>
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">
                {language === 'ur' ? 'ریسٹورنٹ کی اپنی ڈلیوری سروس' : 'Restaurant-managed delivery'}
              </span>
            </div>
          )}
        </div>

        {/* Order Details & Receipt Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items Summary (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-100">
              {t.orderItems}
            </h3>

            <div className="space-y-4">
              {currentOrder.items.map(item => (
                <div
                  key={item.cartItemId}
                  className="flex items-center justify-between text-xs pb-3 border-b border-neutral-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="w-12 h-12 rounded-xl object-cover bg-neutral-100"
                    />
                    <div>
                      <h4 className="font-bold text-neutral-900">
                        {language === 'ur' ? item.menuItem.nameUr : item.menuItem.name}
                      </h4>
                      {item.selectedOptions && (
                        <p className="text-[11px] text-neutral-500">
                          {Object.values(item.selectedOptions).join(', ')}
                        </p>
                      )}
                      <p className="text-neutral-500 font-mono tabular-nums">
                        Qty: {item.quantity} × ₨{item.menuItem.pricePKR + item.selectedOptionsPriceDelta}
                      </p>
                    </div>
                  </div>

                  <span className="font-bold font-mono text-neutral-900 tabular-nums">
                    ₨{item.itemTotal}
                  </span>
                </div>
              ))}
            </div>

            {/* Special notes */}
            {currentOrder.specialInstructions && (
              <div className="mt-4 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs text-neutral-600">
                <span className="font-semibold text-neutral-800">
                  {language === 'ur' ? 'خصوصی ہدایات:' : 'Special Note:'}{' '}
                </span>
                {currentOrder.specialInstructions}
              </div>
            )}
          </div>

          {/* Delivery & Billing Address */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-100">
                {language === 'ur' ? 'ڈلیوری کا پتہ اور بل' : 'Delivery & Payment'}
              </h3>

              <div className="space-y-3 text-xs mb-6">
                <div>
                  <span className="text-neutral-400 block text-[11px] font-medium uppercase tracking-wide">
                    {language === 'ur' ? 'کسٹمر نام و فون' : 'Recipient'}
                  </span>
                  <div className="font-semibold text-neutral-900">{currentOrder.customerName}</div>
                  <div className="text-neutral-600 font-mono">{currentOrder.customerPhone}</div>
                </div>

                <div>
                  <span className="text-neutral-400 block text-[11px] font-medium uppercase tracking-wide">
                    {language === 'ur' ? 'ملتان ایڈریس' : 'Address'}
                  </span>
                  <div className="font-semibold text-amber-900">
                    {neighbourhoodLabels[language][currentOrder.customerNeighbourhood]}
                  </div>
                  <div className="text-neutral-600 leading-relaxed">
                    {currentOrder.customerAddress}
                  </div>
                </div>

                <div>
                  <span className="text-neutral-400 block text-[11px] font-medium uppercase tracking-wide">
                    {t.paymentMethod}
                  </span>
                  <div className="font-semibold text-neutral-900 capitalize">
                    {currentOrder.paymentMethod.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="pt-4 border-t border-neutral-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>{t.subtotal}</span>
                <span className="font-mono tabular-nums">₨{currentOrder.subtotalPKR}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>{t.deliveryCharges}</span>
                <span className="font-mono tabular-nums">₨{currentOrder.deliveryFeePKR}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-neutral-950 pt-2 border-t border-neutral-200">
                <span>{t.total}</span>
                <span className="text-amber-800 font-mono tabular-nums">₨{currentOrder.totalPKR}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
