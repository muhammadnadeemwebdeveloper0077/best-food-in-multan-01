import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations, statusLabels, categoryLabels, neighbourhoodLabels } from '../utils/translations';
import { MenuItem, OrderStatus, CuisineCategory } from '../types';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  ChefHat,
  Bike,
  PackageCheck,
  XCircle,
  Plus,
  Edit2,
  DollarSign,
  Phone,
  MessageCircle,
  Power,
  Store,
  SlidersHorizontal,
  X,
  AlertCircle,
} from 'lucide-react';

export const RestaurantOwnerDashboard: React.FC = () => {
  const {
    language,
    restaurants,
    menuItems,
    orders,
    updateOrderStatus,
    toggleItemAvailability,
    updateMenuItem,
    addMenuItem,
    updateRestaurantSettings,
    selectedOwnerRestaurantId,
    setSelectedOwnerRestaurantId,
  } = useApp();

  const t = translations[language];

  const currentRestaurant = restaurants.find(r => r.id === selectedOwnerRestaurantId) || restaurants[0];
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'settings'>('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');

  // New Menu Item Modal State
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishNameUr, setNewDishNameUr] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishDescUr, setNewDishDescUr] = useState('');
  const [newDishPrice, setNewDishPrice] = useState(950);
  const [newDishCategory, setNewDishCategory] = useState<CuisineCategory>('desi');
  const [newDishPrepTime, setNewDishPrepTime] = useState(25);
  const [newDishIsSpicy, setNewDishIsSpicy] = useState(false);
  const [newDishIsSpecial, setNewDishIsSpecial] = useState(false);

  // Edit Dish Price inline state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);

  // Filter orders for this restaurant
  const restaurantOrders = orders.filter(o => o.restaurantId === currentRestaurant.id);
  const filteredOrders = orderStatusFilter === 'all'
    ? restaurantOrders
    : restaurantOrders.filter(o => o.status === orderStatusFilter);

  // Restaurant dishes
  const restaurantDishes = menuItems.filter(i => i.restaurantId === currentRestaurant.id);

  // Handle adding new dish
  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName) return;

    const newDish: MenuItem = {
      id: `item-${Date.now()}`,
      restaurantId: currentRestaurant.id,
      name: newDishName,
      nameUr: newDishNameUr || newDishName,
      description: newDishDesc || `Prepared fresh at ${currentRestaurant.name}`,
      descriptionUr: newDishDescUr || `${currentRestaurant.nameUr} کی تازہ اور لذیذ پیشکش`,
      pricePKR: Number(newDishPrice),
      category: newDishCategory,
      image: currentRestaurant.coverImage,
      isAvailable: true,
      isSpicy: newDishIsSpicy,
      isSpeciality: newDishIsSpecial,
      preparationTimeMin: Number(newDishPrepTime),
    };

    addMenuItem(newDish);
    setShowAddDishModal(false);
    setNewDishName('');
    setNewDishNameUr('');
    setNewDishDesc('');
    setNewDishDescUr('');
  };

  const handleSavePriceEdit = (item: MenuItem) => {
    updateMenuItem({
      ...item,
      pricePKR: Number(editPriceVal),
    });
    setEditingItemId(null);
  };

  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* Dashboard Top Header Bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
                <Store className="w-4 h-4" />
                <span>{t.ownerDashboard}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                {language === 'ur' ? currentRestaurant.nameUr : currentRestaurant.name}
              </h1>
              <p className="text-xs text-neutral-500">
                {currentRestaurant.neighbourhood} · {currentRestaurant.address}
              </p>
            </div>

            {/* Restaurant Selector & Status Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-500 font-medium">
                  {language === 'ur' ? 'ریسٹورنٹ تبدیل کریں:' : 'Switch Venue:'}
                </label>
                <select
                  value={currentRestaurant.id}
                  onChange={e => setSelectedOwnerRestaurantId(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 focus:outline-none cursor-pointer"
                >
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.neighbourhood})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() =>
                  updateRestaurantSettings({
                    id: currentRestaurant.id,
                    acceptingOrders: !currentRestaurant.acceptingOrders,
                  })
                }
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentRestaurant.acceptingOrders
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>
                  {currentRestaurant.acceptingOrders ? t.openStore : t.closeStore}
                </span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 mt-6 border-b border-neutral-200 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'text-amber-800 border-b-2 border-amber-800'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t.liveOrders}</span>
              {restaurantOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-neutral-950 tabular-nums">
                  {restaurantOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'menu'
                  ? 'text-amber-800 border-b-2 border-amber-800'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>{t.menuManagement} ({restaurantDishes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'text-amber-800 border-b-2 border-amber-800'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{language === 'ur' ? 'ترتیبات و چارجز' : 'Store Settings & Fees'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ================= TAB 1: LIVE ORDERS ================= */}
        {activeTab === 'orders' && (
          <div>
            {/* Status Filter buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
              {(['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-medium cursor-pointer transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {st === 'all'
                    ? (language === 'ur' ? 'تمام آرڈرز' : 'All Orders')
                    : statusLabels[language][st]}
                  {' '}
                  <span className="font-mono text-[11px] opacity-70">
                    ({st === 'all' ? restaurantOrders.length : restaurantOrders.filter(o => o.status === st).length})
                  </span>
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center text-neutral-400">
                <Clock className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-700 mb-1">
                  {language === 'ur' ? 'اس کیٹیگری میں کوئی آرڈر موجود نہیں ہے' : 'No Orders in this Status'}
                </h3>
                <p className="text-xs text-neutral-500">
                  New incoming customer orders will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Header with Order ID and Status */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                        <div>
                          <div className="text-xs font-mono font-bold text-neutral-900">
                            {order.id}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            order.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : order.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'preparing'
                              ? 'bg-purple-100 text-purple-800'
                              : order.status === 'out_for_delivery'
                              ? 'bg-indigo-100 text-indigo-800'
                              : order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {statusLabels[language][order.status]}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-1 text-xs mb-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900 text-sm">
                            {order.customerName}
                          </span>
                          <span className="font-mono text-neutral-600">{order.customerPhone}</span>
                        </div>
                        <div className="text-neutral-500 leading-snug">
                          <strong className="text-amber-900">{order.customerNeighbourhood}:</strong>{' '}
                          {order.customerAddress}
                        </div>
                        {order.specialInstructions && (
                          <div className="p-2 rounded-lg bg-amber-50 text-[11px] text-amber-900 mt-2">
                            <strong>Note:</strong> {order.specialInstructions}
                          </div>
                        )}
                      </div>

                      {/* Order Items List */}
                      <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-200/70 space-y-1.5 text-xs mb-4">
                        {order.items.map(it => (
                          <div key={it.cartItemId} className="flex justify-between">
                            <span className="text-neutral-800">
                              {it.quantity}x {it.menuItem.name}
                              {it.selectedOptions && (
                                <span className="text-[11px] text-neutral-500 block">
                                  ({Object.values(it.selectedOptions).join(', ')})
                                </span>
                              )}
                            </span>
                            <span className="font-mono font-medium text-neutral-900 tabular-nums">
                              ₨{it.itemTotal}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-neutral-950">
                          <span>Total to Collect ({order.paymentMethod.toUpperCase()})</span>
                          <span className="text-amber-800 font-mono tabular-nums">₨{order.totalPKR}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls for Restaurant Staff */}
                    <div className="pt-3 border-t border-neutral-100 space-y-2">
                      <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                        {t.updateStatus}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className={`py-2 px-1 rounded-lg font-medium cursor-pointer transition-colors ${
                            order.status === 'confirmed'
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          Confirm
                        </button>

                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className={`py-2 px-1 rounded-lg font-medium cursor-pointer transition-colors ${
                            order.status === 'preparing'
                              ? 'bg-purple-600 text-white font-bold'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          In Kitchen
                        </button>

                        <button
                          onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                          className={`py-2 px-1 rounded-lg font-medium cursor-pointer transition-colors ${
                            order.status === 'out_for_delivery'
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          Dispatch Rider
                        </button>

                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className={`py-2 px-1 rounded-lg font-medium cursor-pointer transition-colors ${
                            order.status === 'delivered'
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          Delivered
                        </button>
                      </div>

                      {/* WhatsApp / Call Customer directly */}
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`https://wa.me/92${order.customerPhone.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                            `Salam ${order.customerName}! We have updated your order ${order.id} status to: ${order.status.toUpperCase()} at ${currentRestaurant.name}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Customer</span>
                        </a>

                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="py-1.5 px-3 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-medium cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: MENU & PRICES ================= */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {currentRestaurant.name} Dishes
                </h3>
                <p className="text-xs text-neutral-500">
                  Manage live prices in PKR and toggle item availability on the customer app.
                </p>
              </div>

              <button
                onClick={() => setShowAddDishModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addNewItem}</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Dish / Item</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Price (PKR)</th>
                      <th className="px-5 py-3">Prep Time</th>
                      <th className="px-5 py-3">Availability</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {restaurantDishes.map(dish => (
                      <tr key={dish.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={dish.image}
                              alt={dish.name}
                              className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-neutral-900">{dish.name}</div>
                              <div className="text-[11px] text-neutral-500 font-urdu">{dish.nameUr}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="capitalize text-neutral-700">
                            {categoryLabels[language][dish.category] || dish.category}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-mono font-bold text-neutral-900 tabular-nums">
                          {editingItemId === dish.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={editPriceVal}
                                onChange={e => setEditPriceVal(Number(e.target.value))}
                                className="w-20 px-2 py-1 border border-neutral-300 rounded text-xs"
                              />
                              <button
                                onClick={() => handleSavePriceEdit(dish)}
                                className="px-2 py-1 bg-amber-800 text-white rounded text-[10px] cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>₨{dish.pricePKR}</span>
                              <button
                                onClick={() => {
                                  setEditingItemId(dish.id);
                                  setEditPriceVal(dish.pricePKR);
                                }}
                                className="text-neutral-400 hover:text-neutral-800 p-0.5 cursor-pointer"
                                title="Edit Price"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-neutral-600">
                          {dish.preparationTimeMin} mins
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => toggleItemAvailability(dish.id)}
                            className={`px-3 py-1 rounded-full font-semibold text-[11px] cursor-pointer transition-colors ${
                              dish.isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-neutral-200 text-neutral-600'
                            }`}
                          >
                            {dish.isAvailable ? t.inStock : t.outOfStock}
                          </button>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => toggleItemAvailability(dish.id)}
                            className="text-xs text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                          >
                            {dish.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Restaurant Profile & Delivery Rules
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              Update your delivery fee, minimum order, WhatsApp hotline, and operating hours.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={currentRestaurant.openingHours}
                  onChange={e =>
                    updateRestaurantSettings({ id: currentRestaurant.id, openingHours: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Standard Delivery Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={currentRestaurant.deliveryFeePKR}
                    onChange={e =>
                      updateRestaurantSettings({
                        id: currentRestaurant.id,
                        deliveryFeePKR: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Minimum Order Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={currentRestaurant.minOrderPKR}
                    onChange={e =>
                      updateRestaurantSettings({
                        id: currentRestaurant.id,
                        minOrderPKR: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    WhatsApp Hotline (Country code without +)
                  </label>
                  <input
                    type="text"
                    value={currentRestaurant.whatsapp}
                    onChange={e =>
                      updateRestaurantSettings({
                        id: currentRestaurant.id,
                        whatsapp: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={currentRestaurant.phone}
                    onChange={e =>
                      updateRestaurantSettings({
                        id: currentRestaurant.id,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Google Maps URL
                </label>
                <input
                  type="text"
                  value={currentRestaurant.mapsUrl}
                  onChange={e =>
                    updateRestaurantSettings({
                      id: currentRestaurant.id,
                      mapsUrl: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Official Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.14thstreetpizza.com/"
                  value={currentRestaurant.websiteUrl || ''}
                  onChange={e =>
                    updateRestaurantSettings({
                      id: currentRestaurant.id,
                      websiteUrl: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-emerald-700 font-medium">
                  ✓ Settings saved automatically to local memory
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Dish Modal */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900">
                {t.addNewItem} — {currentRestaurant.name}
              </h3>
              <button
                onClick={() => setShowAddDishModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Dish Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={newDishName}
                    onChange={e => setNewDishName(e.target.value)}
                    placeholder="e.g. Mutton Shinwari Karahi"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Dish Name (Urdu)</label>
                  <input
                    type="text"
                    value={newDishNameUr}
                    onChange={e => setNewDishNameUr(e.target.value)}
                    placeholder="مثلاً: مٹن شینواری کڑاہی"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-urdu"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={newDishDesc}
                  onChange={e => setNewDishDesc(e.target.value)}
                  placeholder="Ingredients, preparation style..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={newDishPrice}
                    onChange={e => setNewDishPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={newDishPrepTime}
                    onChange={e => setNewDishPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={newDishCategory}
                    onChange={e => setNewDishCategory(e.target.value as CuisineCategory)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                  >
                    <option value="karahi">Karahi</option>
                    <option value="bbq">BBQ</option>
                    <option value="biryani">Biryani</option>
                    <option value="pizza">Pizza</option>
                    <option value="burgers">Burgers</option>
                    <option value="fast_food">Fast Food</option>
                    <option value="desi">Desi</option>
                    <option value="sohan_halwa">Sohan Halwa</option>
                    <option value="beverages">Beverages</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDishIsSpicy}
                    onChange={e => setNewDishIsSpicy(e.target.checked)}
                    className="rounded text-amber-800"
                  />
                  <span>Spicy Dish (تیکھا)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDishIsSpecial}
                    onChange={e => setNewDishIsSpecial(e.target.checked)}
                    className="rounded text-amber-800"
                  />
                  <span>Multan Speciality (خاص ڈش)</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
