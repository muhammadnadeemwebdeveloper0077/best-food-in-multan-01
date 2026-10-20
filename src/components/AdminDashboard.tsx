import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations, neighbourhoodLabels } from '../utils/translations';
import { Restaurant, MultanNeighbourhood, CuisineCategory } from '../types';
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
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    language,
    restaurants,
    orders,
    toggleVerifyRestaurant,
    togglePublishRestaurant,
    toggleFeaturedRestaurant,
    addRestaurant,
    importRestaurantsFromCSV,
    exportRestaurantsCSV,
  } = useApp();

  const t = translations[language];

  const [searchFilter, setSearchFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

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

  const handleExportCSV = () => {
    const csvData = exportRestaurantsCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `multan-restaurants-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                onClick={() => setShowSupabaseModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase SQL</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
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

        {/* Directory Table Card */}
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
                          <div className="font-bold text-neutral-900">{r.name}</div>
                          <div className="text-[11px] text-neutral-500 font-urdu">{r.nameUr}</div>
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

                      {r.websiteUrl && (
                        <a
                          href={r.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 inline-flex items-center"
                          title={`Official Website (${r.websiteUrl})`}
                        >
                          <Globe className="w-3.5 h-3.5" />
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
    </div>
  );
};
