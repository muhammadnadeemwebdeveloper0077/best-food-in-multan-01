import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations, neighbourhoodLabels } from '../utils/translations';
import { Restaurant, MultanNeighbourhood, CuisineCategory, MenuItem, PizzaSize, BurgerType } from '../types';
import { SUPABASE_SQL_SCHEMA, CSV_SAMPLE_TEMPLATE } from '../data/supabaseSchema';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Plus,
  Download,
  Upload,
  Database,
  Search,
  ExternalLink,
  Star,
  Copy,
  Check,
  X,
  FileSpreadsheet,
  Globe,
  Utensils,
  Flame,
  BadgeCheck,
  Edit2,
  Trash2,
  Save,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    language,
    restaurants,
    orders,
    menuItems,
    addMenuItem,
    updateMenuItem,
    toggleItemAvailability,
    deleteMenuItem,
    toggleVerifyRestaurant,
    togglePublishRestaurant,
    toggleFeaturedRestaurant,
    addRestaurant,
    importRestaurantsFromCSV,
    exportRestaurantsCSV,
    exportRestaurantsJSON,
    exportMenuItemsCSV,
    exportMenuItemsJSON,
    exportFullDatabaseJSON,
    resetDatabaseToDefaults,
  } = useApp();

  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'restaurants' | 'pizza_burger'>('restaurants');

  const [searchFilter, setSearchFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [csvInput, setCsvInput] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Food Item Management State
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCategoryFilter, setFoodCategoryFilter] = useState<'all' | 'pizza' | 'burgers'>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);

  // New Food Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemNameUr, setNewItemNameUr] = useState('');
  const [newItemRestId, setNewItemRestId] = useState(restaurants[0]?.id || 'rest-14th-street');
  const [newItemCategory, setNewItemCategory] = useState<'pizza' | 'burgers'>('pizza');
  const [newItemPrice, setNewItemPrice] = useState(799);
  const [newItemPizzaSize, setNewItemPizzaSize] = useState<PizzaSize>('medium');
  const [newItemBurgerType, setNewItemBurgerType] = useState<BurgerType>('zinger');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemDescUr, setNewItemDescUr] = useState('');
  const [newItemImage, setNewItemImage] = useState('');

  // New Restaurant Form State
  const [newRestName, setNewRestName] = useState('');
  const [newRestNameUr, setNewRestNameUr] = useState('');
  const [newRestTagline, setNewRestTagline] = useState('');
  const [newRestTaglineUr, setNewRestTaglineUr] = useState('');
  const [newRestNeighbourhood, setNewRestNeighbourhood] = useState<MultanNeighbourhood>('Gulgasht Colony');
  const [newRestAddress, setNewRestAddress] = useState('');
  const [newRestAddressUr, setNewRestAddressUr] = useState('');
  const [newRestPhone, setNewRestPhone] = useState('+92 61 1112233');
  const [newRestWhatsapp, setNewRestWhatsapp] = useState('923001234567');
  const [newRestMinOrder, setNewRestMinOrder] = useState(800);
  const [newRestDeliveryFee, setNewRestDeliveryFee] = useState(150);

  const totalVerified = restaurants.filter(r => r.isVerified).length;
  const totalPublished = restaurants.filter(r => r.isPublished).length;
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalPKR, 0);

  const filteredRestaurants = restaurants.filter(
    r =>
      r.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.neighbourhood.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleCreateRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestName) return;

    const newRest: Restaurant = {
      id: `rest-${Date.now()}`,
      name: newRestName,
      nameUr: newRestNameUr || newRestName,
      tagline: newRestTagline || `Delicious cuisine in ${newRestNeighbourhood}`,
      taglineUr: newRestTaglineUr || `${newRestNeighbourhood} کے بہترین کھانے`,
      slug: newRestName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=160&auto=format&fit=crop&q=80',
      coverImage: restaurants[0].coverImage,
      neighbourhood: newRestNeighbourhood,
      address: newRestAddress || `${newRestNeighbourhood}, Multan`,
      addressUr: newRestAddressUr || `${newRestNeighbourhood}، ملتان`,
      phone: newRestPhone,
      whatsapp: newRestWhatsapp,
      mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(newRestName + ' ' + newRestNeighbourhood + ' Multan')}`,
      rating: 4.6,
      reviewCount: 1,
      deliveryTimeMin: 30,
      deliveryTimeMax: 45,
      deliveryFeePKR: Number(newRestDeliveryFee),
      minOrderPKR: Number(newRestMinOrder),
      isVerified: true,
      isPublished: true,
      isFeatured: false,
      acceptingOrders: true,
      cuisines: ['desi'],
      ownerEmail: 'manager@multanfood.pk',
      openingHours: '12:00 PM - 12:00 AM',
    };

    addRestaurant(newRest);
    setShowAddModal(false);
    setNewRestName('');
    setNewRestNameUr('');
    setNewRestAddress('');
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportRestaurantsCSV = () => {
    downloadFile(`multan_restaurants_directory_${Date.now()}.csv`, exportRestaurantsCSV(), 'text/csv;charset=utf-8;');
  };

  const handleExportRestaurantsJSON = () => {
    downloadFile(`multan_restaurants_directory_${Date.now()}.json`, exportRestaurantsJSON(), 'application/json;charset=utf-8;');
  };

  const handleExportMenuCSV = () => {
    downloadFile(`multan_food_prices_${Date.now()}.csv`, exportMenuItemsCSV(), 'text/csv;charset=utf-8;');
  };

  const handleExportMenuJSON = () => {
    downloadFile(`multan_food_prices_${Date.now()}.json`, exportMenuItemsJSON(), 'application/json;charset=utf-8;');
  };

  const handleExportFullDatabaseJSON = () => {
    downloadFile(`best_food_multan_complete_database_${Date.now()}.json`, exportFullDatabaseJSON(), 'application/json;charset=utf-8;');
  };

  const handleResetToDefaults = () => {
    resetDatabaseToDefaults();
    setResetNotice('Database synchronized with latest Multan restaurants, menus, and verified prices!');
    setTimeout(() => setResetNotice(null), 3500);
  };

  const handleImportSubmit = () => {
    if (!csvInput.trim()) return;
    const res = importRestaurantsFromCSV(csvInput);
    if (res.error) {
      setImportNotice(`Error: ${res.error}`);
    } else {
      setImportNotice(`Successfully imported ${res.added} restaurants!`);
      setTimeout(() => {
        setShowImportModal(false);
        setImportNotice(null);
        setCsvInput('');
      }, 1500);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  // Filtered Food Items for Pizza & Burger Database
  const filteredFoodItems = menuItems.filter(item => {
    const isPizza =
      item.category === 'pizza' ||
      item.name.toLowerCase().includes('pizza') ||
      item.name.toLowerCase().includes('slice');
    const isBurger =
      item.category === 'burgers' ||
      item.name.toLowerCase().includes('burger') ||
      item.name.toLowerCase().includes('zinger') ||
      item.name.toLowerCase().includes('bun kabab');

    if (!isPizza && !isBurger) return false;

    if (foodCategoryFilter === 'pizza' && !isPizza) return false;
    if (foodCategoryFilter === 'burgers' && !isBurger) return false;

    if (foodSearch.trim()) {
      const q = foodSearch.toLowerCase().trim();
      const rest = restaurants.find(r => r.id === item.restaurantId);
      const match =
        item.name.toLowerCase().includes(q) ||
        item.nameUr.includes(q) ||
        rest?.name.toLowerCase().includes(q) ||
        rest?.nameUr.includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleStartEditPrice = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditingPrice(item.pricePKR);
  };

  const handleSavePrice = (item: MenuItem) => {
    if (editingPrice > 0) {
      updateMenuItem({
        ...item,
        pricePKR: editingPrice,
        verifiedPrice: true,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }
    setEditingItemId(null);
  };

  const handleCreateFoodItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || newItemPrice <= 0) return;

    const newFood: MenuItem = {
      id: `item-admin-${Date.now()}`,
      restaurantId: newItemRestId,
      name: newItemName,
      nameUr: newItemNameUr || newItemName,
      description: newItemDesc || `${newItemName} in Multan`,
      descriptionUr: newItemDescUr || `${newItemNameUr || newItemName} ملتان`,
      pricePKR: Number(newItemPrice),
      category: newItemCategory,
      pizzaSize: newItemCategory === 'pizza' ? newItemPizzaSize : undefined,
      burgerType: newItemCategory === 'burgers' ? newItemBurgerType : undefined,
      image:
        newItemImage ||
        (newItemCategory === 'pizza'
          ? 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'),
      isAvailable: true,
      verifiedPrice: true,
      updatedAt: new Date().toISOString().split('T')[0],
      preparationTimeMin: 20,
    };

    addMenuItem(newFood);
    setShowAddFoodModal(false);
    setNewItemName('');
    setNewItemNameUr('');
    setNewItemDesc('');
    setNewItemDescUr('');
    setNewItemImage('');
  };

  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span>{t.adminDashboard}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Multan Restaurant Directory Management
              </h1>
              <p className="text-xs text-neutral-500">
                Verify restaurant listings, manage publication status, export CSV data, and configure Supabase.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Database (CSV / JSON)</span>
              </button>

              <button
                onClick={handleResetToDefaults}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Restore latest Multan restaurant & price directory defaults"
              >
                <span>🔄 Sync Latest</span>
              </button>

              {activeTab === 'restaurants' ? (
                <>
                  <button
                    onClick={() => setShowSupabaseModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Supabase SQL</span>
                  </button>

                  <button
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import CSV</span>
                  </button>

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Restaurant</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAddFoodModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Pizza / Burger Dish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Row (Zero-pill discipline) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5">
            <span className="text-xs text-neutral-500 font-medium block mb-1">
              {t.totalRestaurants}
            </span>
            <span className="text-2xl font-extrabold text-neutral-900 tabular-nums font-mono">
              {restaurants.length}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5">
            <span className="text-xs text-neutral-500 font-medium block mb-1">
              {t.verifiedListings}
            </span>
            <span className="text-2xl font-extrabold text-emerald-700 tabular-nums font-mono">
              {totalVerified}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5">
            <span className="text-xs text-neutral-500 font-medium block mb-1">
              Active Orders
            </span>
            <span className="text-2xl font-extrabold text-neutral-900 tabular-nums font-mono">
              {orders.length}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5">
            <span className="text-xs text-neutral-500 font-medium block mb-1">
              Total Order Volume (PKR)
            </span>
            <span className="text-2xl font-extrabold text-amber-800 tabular-nums font-mono">
              ₨{totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('restaurants')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'restaurants'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <span>🏬 Multan Restaurants ({restaurants.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pizza_burger')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'pizza_burger'
                ? 'bg-amber-800 text-white shadow-xs ring-2 ring-amber-700/50'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <span>🍕🍔 Pizza & Burger Price Database ({filteredFoodItems.length})</span>
          </button>
        </div>

        {/* Tab 1: Directory Table Card */}
        {activeTab === 'restaurants' && (
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
          {/* Table Search Toolbar */}
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search Multan listing or neighbourhood..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>

            <div className="text-xs text-neutral-500">
              Showing <strong className="text-neutral-900">{filteredRestaurants.length}</strong> of {restaurants.length} listings
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Restaurant</th>
                  <th className="px-5 py-3">Neighbourhood</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Fees (PKR)</th>
                  <th className="px-5 py-3">Verification</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredRestaurants.map(r => (
                  <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.coverImage}
                          alt={r.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-neutral-900 flex items-center gap-1.5 flex-wrap">
                            <span>{r.name}</span>
                            {r.branchName && (
                              <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200">
                                {r.branchName}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-urdu">{r.nameUr}</div>
                          {r.lastVerifiedDate && (
                            <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-mono mt-0.5">
                              <BadgeCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>Verified {r.lastVerifiedDate}</span>
                              {r.priceRange && <span className="text-neutral-400">• {r.priceRange}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-neutral-700 font-medium">
                      {neighbourhoodLabels[language][r.neighbourhood] || r.neighbourhood}
                    </td>

                    <td className="px-5 py-4 text-neutral-600 font-mono text-[11px]">
                      <div>{r.phone}</div>
                      <div className="text-emerald-700">WA: {r.whatsapp}</div>
                    </td>

                    <td className="px-5 py-4 font-mono tabular-nums text-neutral-700">
                      <div>Fee: ₨{r.deliveryFeePKR}</div>
                      <div className="text-neutral-400 text-[11px]">Min: ₨{r.minOrderPKR}</div>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleVerifyRestaurant(r.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors ${
                          r.isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {r.isVerified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Unverified</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => togglePublishRestaurant(r.id)}
                        className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors ${
                          r.isPublished
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {r.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => toggleFeaturedRestaurant(r.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer inline-flex items-center ${
                          r.isFeatured
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'border-neutral-200 text-neutral-400 hover:text-neutral-800'
                        }`}
                        title={r.isFeatured ? 'Featured Listing' : 'Make Featured'}
                      >
                        <Star className={`w-3.5 h-3.5 ${r.isFeatured ? 'fill-amber-500' : ''}`} />
                      </button>

                      {(r.websiteUrl || r.officialWebsite) && (
                        <a
                          href={r.officialWebsite || r.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 inline-flex items-center"
                          title={`Official Website (${r.officialWebsite || r.websiteUrl})`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {r.onlineOrderUrl && (
                        <a
                          href={r.onlineOrderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 inline-flex items-center"
                          title={`Online Order (${r.onlineOrderUrl})`}
                        >
                          <Utensils className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <a
                        href={r.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 inline-flex items-center"
                        title="Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* Tab 2: Pizza & Burger Price Database Management */}
        {activeTab === 'pizza_burger' && (
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
            {/* Table Search & Filter Toolbar */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={foodSearch}
                    onChange={e => setFoodSearch(e.target.value)}
                    placeholder="Search pizza, burger, joint..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>

                {/* Category filter pills */}
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                  <button
                    onClick={() => setFoodCategoryFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      foodCategoryFilter === 'all'
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    All ({menuItems.filter(i => i.category === 'pizza' || i.category === 'burgers').length})
                  </button>
                  <button
                    onClick={() => setFoodCategoryFilter('pizza')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      foodCategoryFilter === 'pizza'
                        ? 'bg-white text-amber-900 shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    🍕 Pizza
                  </button>
                  <button
                    onClick={() => setFoodCategoryFilter('burgers')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      foodCategoryFilter === 'burgers'
                        ? 'bg-white text-amber-900 shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    🍔 Burger
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500">
                  Showing <strong className="text-neutral-900">{filteredFoodItems.length}</strong> items
                </span>
                <button
                  onClick={() => setShowAddFoodModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Dish</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Dish / Food Item</th>
                    <th className="px-5 py-3">Restaurant & Area</th>
                    <th className="px-5 py-3">Category & Size/Type</th>
                    <th className="px-5 py-3">Verified Price (PKR)</th>
                    <th className="px-5 py-3">Stock Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredFoodItems.map(item => {
                    const rest = restaurants.find(r => r.id === item.restaurantId);
                    const isPizza =
                      item.category === 'pizza' ||
                      item.name.toLowerCase().includes('pizza') ||
                      item.name.toLowerCase().includes('slice');
                    const isEditing = editingItemId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                        {/* Food Name & Image */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-11 h-11 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                            />
                            <div>
                              <div className="font-bold text-neutral-900 text-xs sm:text-sm">
                                {item.name}
                              </div>
                              <div className="text-[11px] text-neutral-500 font-urdu">{item.nameUr}</div>
                              {item.dealBadge && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-700 font-bold">
                                  <Flame className="w-2.5 h-2.5 text-orange-600" />
                                  <span>{item.dealBadge}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Restaurant & Area */}
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-neutral-900">{rest?.name || 'Multan Joint'}</div>
                          <div className="text-[11px] text-neutral-500">{rest?.neighbourhood || 'All Multan'}</div>
                        </td>

                        {/* Category & Size */}
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 font-semibold text-[11px]">
                              {isPizza ? '🍕 Pizza' : '🍔 Burger'}
                            </span>
                            {item.pizzaSize && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium text-[10px]">
                                {item.pizzaSize}
                              </span>
                            )}
                            {item.burgerType && (
                              <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 font-medium text-[10px]">
                                {item.burgerType}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Price & Inline Editing */}
                        <td className="px-5 py-3.5 font-mono">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-neutral-500">Rs.</span>
                              <input
                                type="number"
                                min={50}
                                step={10}
                                value={editingPrice}
                                onChange={e => setEditingPrice(Number(e.target.value))}
                                className="w-24 px-2 py-1 text-xs border border-amber-500 rounded-lg focus:outline-none ring-1 ring-amber-500 font-bold text-amber-900"
                              />
                              <button
                                onClick={() => handleSavePrice(item)}
                                className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                title="Save Price"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="p-1 rounded bg-neutral-200 text-neutral-700 hover:bg-neutral-300 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-neutral-900 text-sm">
                                Rs. {item.pricePKR}
                              </span>
                              <button
                                onClick={() => handleStartEditPrice(item)}
                                className="p-1 text-neutral-400 hover:text-amber-800 rounded hover:bg-amber-50 transition-colors cursor-pointer"
                                title="Edit Price"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Stock Status */}
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => toggleItemAvailability(item.id)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                              item.isAvailable
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            {item.isAvailable ? 'In Stock' : 'Sold Out'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => deleteMenuItem(item.id)}
                            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Add New Restaurant */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900">
                {t.addRestaurant}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Restaurant Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={newRestName}
                    onChange={e => setNewRestName(e.target.value)}
                    placeholder="e.g. Al-Madina Biryani Cantt"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Name (Urdu)</label>
                  <input
                    type="text"
                    value={newRestNameUr}
                    onChange={e => setNewRestNameUr(e.target.value)}
                    placeholder="المدینہ بریانی کینٹ"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-urdu"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Neighbourhood in Multan *</label>
                <select
                  value={newRestNeighbourhood}
                  onChange={e => setNewRestNeighbourhood(e.target.value as MultanNeighbourhood)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
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

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Street Address in Multan *</label>
                <input
                  type="text"
                  required
                  value={newRestAddress}
                  onChange={e => setNewRestAddress(e.target.value)}
                  placeholder="e.g. Shop 4, Nusrat Road, Cantt, Multan"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newRestPhone}
                    onChange={e => setNewRestPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">WhatsApp Order Number</label>
                  <input
                    type="text"
                    value={newRestWhatsapp}
                    onChange={e => setNewRestWhatsapp(e.target.value)}
                    placeholder="923001234567"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Delivery Fee (PKR)</label>
                  <input
                    type="number"
                    value={newRestDeliveryFee}
                    onChange={e => setNewRestDeliveryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Min. Order Amount (PKR)</label>
                  <input
                    type="number"
                    value={newRestMinOrder}
                    onChange={e => setNewRestMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold cursor-pointer shadow-xs"
                >
                  Publish to Multan Directory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: CSV Import */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <span>Import Multan Restaurants CSV</span>
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 mb-3">
              Paste CSV text formatted with restaurant columns (id, name, name_ur, neighbourhood, address, phone, whatsapp).
            </p>

            <button
              onClick={() => setCsvInput(CSV_SAMPLE_TEMPLATE)}
              className="text-xs text-amber-800 hover:underline font-semibold mb-2 block cursor-pointer"
            >
              Click here to load Multan CSV template sample
            </button>

            <textarea
              rows={8}
              value={csvInput}
              onChange={e => setCsvInput(e.target.value)}
              placeholder="id,name,name_ur,neighbourhood,address..."
              className="w-full p-3 font-mono text-xs border border-neutral-300 rounded-xl bg-neutral-50 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-800"
            />

            {importNotice && (
              <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs mb-3 font-medium">
                {importNotice}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="flex-1 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold cursor-pointer text-xs shadow-xs"
              >
                Import Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Supabase SQL & Architecture Setup */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-neutral-900">
                  Supabase Backend & Database Setup
                </h3>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
              Copy this production PostgreSQL schema into your <strong>Supabase SQL Editor</strong> to create the tables for restaurants, menu items, customers, and restaurant-managed delivery orders.
            </p>

            <div className="relative mb-4">
              <pre className="bg-neutral-900 text-neutral-200 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed">
                {SUPABASE_SQL_SCHEMA}
              </pre>
              <button
                onClick={handleCopySchema}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 text-xs space-y-1 mb-4 text-neutral-600">
              <div className="font-semibold text-neutral-900">Next Steps for Netlify Deployment:</div>
              <div>1. In Netlify Site Settings → Environment Variables, set <code className="bg-neutral-200 px-1 rounded font-mono">VITE_SUPABASE_URL</code> and <code className="bg-neutral-200 px-1 rounded font-mono">VITE_SUPABASE_ANON_KEY</code>.</div>
              <div>2. The application is configured to build with <code className="bg-neutral-200 px-1 rounded font-mono">npm run build</code> into <code className="bg-neutral-200 px-1 rounded font-mono">dist</code>.</div>
            </div>

            <button
              onClick={() => setShowSupabaseModal(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal 4: Add New Pizza or Burger Item */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-800" />
                <h3 className="text-base font-bold text-neutral-900">
                  Add Pizza or Burger Dish to Multan Database
                </h3>
              </div>
              <button
                onClick={() => setShowAddFoodModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFoodItem} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Dish Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    placeholder="e.g. 14th Street Chicken Fajita"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Name (Urdu)</label>
                  <input
                    type="text"
                    value={newItemNameUr}
                    onChange={e => setNewItemNameUr(e.target.value)}
                    placeholder="فجیتا پیزا"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-urdu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Multan Restaurant *</label>
                  <select
                    value={newItemRestId}
                    onChange={e => setNewItemRestId(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white"
                  >
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.neighbourhood})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Food Category *</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white"
                  >
                    <option value="pizza">🍕 Pizza & Italian</option>
                    <option value="burgers">🍔 Burger & Sandwiches</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Verified Price in PKR *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono">Rs.</span>
                    <input
                      type="number"
                      required
                      min={50}
                      step={10}
                      value={newItemPrice}
                      onChange={e => setNewItemPrice(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl font-bold font-mono"
                    />
                  </div>
                </div>

                {newItemCategory === 'pizza' ? (
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Pizza Size *</label>
                    <select
                      value={newItemPizzaSize}
                      onChange={e => setNewItemPizzaSize(e.target.value as PizzaSize)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white"
                    >
                      <option value="small">Small (7"-8" Solo)</option>
                      <option value="medium">Medium (9"-12" Pan)</option>
                      <option value="large">Large (13"-15" XL)</option>
                      <option value="family">Family Feast Combo</option>
                      <option value="monster_slice">20" Monster Slice</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Burger Type *</label>
                    <select
                      value={newItemBurgerType}
                      onChange={e => setNewItemBurgerType(e.target.value as BurgerType)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white"
                    >
                      <option value="zinger">Crispy Zinger Chicken</option>
                      <option value="beef">Juicy Prime Beef</option>
                      <option value="cheese">Double Cheddar Melt</option>
                      <option value="chicken">Charcoal Grilled Chicken</option>
                      <option value="egg_shami">Multani Egg Shami Bun Kabab</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  placeholder="Ingredients, toppings, crust details..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description (Urdu)</label>
                <textarea
                  rows={2}
                  value={newItemDescUr}
                  onChange={e => setNewItemDescUr(e.target.value)}
                  placeholder="کھانے کے اجزاء اور تفصیل..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-urdu"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={newItemImage}
                  onChange={e => setNewItemImage(e.target.value)}
                  placeholder="https://... (defaults to high-res gourmet asset)"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowAddFoodModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-semibold cursor-pointer hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-800 text-white font-bold cursor-pointer hover:bg-amber-900 shadow-sm"
                >
                  Save Dish to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Center Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    Multan Food Database Export Center
                  </h2>
                  <p className="text-xs text-neutral-500 font-urdu">
                    ملتان ریسٹورنٹس اور مینو ڈیٹا بیس ڈاؤن لوڈ و ایکسپورٹ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <p className="text-neutral-600 leading-relaxed">
                Download structured, authentic datasets of Multan’s local restaurants, international food brands, pizza parlors, burger joints, and desi cuisine hubs. Available in both <strong>CSV</strong> (Excel/Sheets) and <strong>JSON</strong> formats.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* 1. Restaurants CSV */}
                <div className="p-4 rounded-2xl border border-neutral-200 hover:border-emerald-500 bg-neutral-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-neutral-900 text-sm">Restaurants (CSV)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        {restaurants.length} Spots
                      </span>
                    </div>
                    <p className="text-neutral-500 text-[11px] mb-3">
                      Bilingual names, branch locations, verified phone & WhatsApp, addresses, order links, and verification status in spreadsheet format.
                    </p>
                  </div>
                  <button
                    onClick={handleExportRestaurantsCSV}
                    className="w-full py-2 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-neutral-800 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download Restaurants (.csv)</span>
                  </button>
                </div>

                {/* 2. Restaurants JSON */}
                <div className="p-4 rounded-2xl border border-neutral-200 hover:border-emerald-500 bg-neutral-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-neutral-900 text-sm">Restaurants (JSON)</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                        Structured API
                      </span>
                    </div>
                    <p className="text-neutral-500 text-[11px] mb-3">
                      Complete array of restaurant objects with past heritage stories, photo galleries, coordinates, and operating hours for developers.
                    </p>
                  </div>
                  <button
                    onClick={handleExportRestaurantsJSON}
                    className="w-full py-2 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-neutral-800 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Download Restaurants (.json)</span>
                  </button>
                </div>

                {/* 3. Menu & Prices CSV */}
                <div className="p-4 rounded-2xl border border-neutral-200 hover:border-emerald-500 bg-neutral-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-neutral-900 text-sm">Menu & Prices (CSV)</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                        {menuItems.length} Items
                      </span>
                    </div>
                    <p className="text-neutral-500 text-[11px] mb-3">
                      Every dish with PKR verified prices, pizza sizes (small/med/large), burger varieties, deal combos, and restaurant links.
                    </p>
                  </div>
                  <button
                    onClick={handleExportMenuCSV}
                    className="w-full py-2 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-neutral-800 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-700" />
                    <span>Download Menu Prices (.csv)</span>
                  </button>
                </div>

                {/* 4. Menu & Prices JSON */}
                <div className="p-4 rounded-2xl border border-neutral-200 hover:border-emerald-500 bg-neutral-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-neutral-900 text-sm">Menu & Prices (JSON)</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                        Full Schema
                      </span>
                    </div>
                    <p className="text-neutral-500 text-[11px] mb-3">
                      Full menu schema with preparation times, options/modifiers, Urdu translations, and high-resolution photography URLs.
                    </p>
                  </div>
                  <button
                    onClick={handleExportMenuJSON}
                    className="w-full py-2 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-neutral-800 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Download Menu Prices (.json)</span>
                  </button>
                </div>
              </div>

              {/* 5. Full Combined Database Bundle */}
              <div className="p-5 rounded-2xl border-2 border-emerald-500/60 bg-emerald-50/40 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-emerald-950 text-sm">
                        Complete Multan Food Database Bundle (JSON)
                      </span>
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-emerald-900/80 text-[11px]">
                      Master export containing directory metadata, all {restaurants.length} verified Multan food brands & restaurants, plus all {menuItems.length} menu items and price records in a single archive.
                    </p>
                  </div>
                  <button
                    onClick={handleExportFullDatabaseJSON}
                    className="shrink-0 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Master Bundle</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
