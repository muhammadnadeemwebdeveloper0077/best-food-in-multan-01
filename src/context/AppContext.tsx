import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CartItem,
  Language,
  MenuItem,
  OrderStatus,
  Order,
  Restaurant,
  UserRole,
} from '../types';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_RESTAURANTS,
} from '../data/multanRestaurants';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  cart: CartItem[];
  cartRestaurantId: string | null;
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  view: 'explore' | 'restaurant-detail' | 'track-order' | 'owner-dashboard' | 'admin-dashboard';
  setView: (view: 'explore' | 'restaurant-detail' | 'track-order' | 'owner-dashboard' | 'admin-dashboard') => void;
  selectedOwnerRestaurantId: string;
  setSelectedOwnerRestaurantId: (id: string) => void;

  // Cart operations
  addToCart: (
    item: MenuItem,
    quantity?: number,
    selectedOptions?: Record<string, string>,
    priceDelta?: number
  ) => { success: boolean; conflictingRestaurant?: Restaurant };
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  forceAddToCartAndClear: (
    item: MenuItem,
    quantity?: number,
    selectedOptions?: Record<string, string>,
    priceDelta?: number
  ) => void;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartTotal: number;

  // Order operations
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Owner / Admin Item operations
  toggleItemAvailability: (itemId: string) => void;
  updateMenuItem: (item: MenuItem) => void;
  addMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
  updateRestaurantSettings: (updated: Partial<Restaurant> & { id: string }) => void;

  // Admin operations
  toggleVerifyRestaurant: (restaurantId: string) => void;
  togglePublishRestaurant: (restaurantId: string) => void;
  toggleFeaturedRestaurant: (restaurantId: string) => void;
  addRestaurant: (newRest: Restaurant) => void;
  importRestaurantsFromCSV: (csvText: string) => { added: number; error?: string };
  exportRestaurantsCSV: () => string;
  exportRestaurantsJSON: () => string;
  exportMenuItemsCSV: () => string;
  exportMenuItemsJSON: () => string;
  exportFullDatabaseJSON: () => string;
  resetDatabaseToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LANG: 'best_food_multan_lang',
  ROLE: 'best_food_multan_role',
  RESTS: 'best_food_multan_restaurants',
  ITEMS: 'best_food_multan_items',
  ORDERS: 'best_food_multan_orders',
  CART: 'best_food_multan_cart',
  CART_REST: 'best_food_multan_cart_rest',
  ACTIVE_ORDER: 'best_food_multan_active_order',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return (saved === 'ur' || saved === 'en') ? saved : 'en';
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved === 'customer' || saved === 'restaurant_owner' || saved === 'admin') ? saved : 'customer';
  });

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESTS);
      if (saved) {
        const parsed: Restaurant[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(r => r.id));
        const merged: Restaurant[] = parsed.map(r => {
          const init = INITIAL_RESTAURANTS.find(ir => ir.id === r.id);
          return init
            ? {
                ...init,
                ...r,
                branchName: r.branchName || init.branchName,
                branchNameUr: r.branchNameUr || init.branchNameUr,
                officialWebsite: r.officialWebsite || init.officialWebsite,
                onlineOrderUrl: r.onlineOrderUrl || init.onlineOrderUrl,
                menuUrl: r.menuUrl || init.menuUrl,
                lastVerifiedDate: r.lastVerifiedDate || init.lastVerifiedDate,
                priceRange: r.priceRange || init.priceRange,
                priceRangeUr: r.priceRangeUr || init.priceRangeUr,
                websiteUrl: r.websiteUrl || init.websiteUrl,
                liveDealsUrl: r.liveDealsUrl || init.liveDealsUrl,
                pastStory: r.pastStory || init.pastStory,
                activeDealBanner: r.activeDealBanner || init.activeDealBanner,
                activeDealBannerUr: r.activeDealBannerUr || init.activeDealBannerUr,
              }
            : r;
        });

        // Add any newly created restaurants from INITIAL_RESTAURANTS not yet in user's localStorage
        INITIAL_RESTAURANTS.forEach(ir => {
          if (!existingIds.has(ir.id)) {
            merged.push(ir);
          }
        });
        return merged;
      }
      return INITIAL_RESTAURANTS;
    } catch {
      return INITIAL_RESTAURANTS;
    }
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (saved) {
        const parsed: MenuItem[] = JSON.parse(saved);
        const map = new Map<string, MenuItem>();
        INITIAL_MENU_ITEMS.forEach(item => map.set(item.id, item));
        parsed.forEach(item => {
          const init = map.get(item.id);
          map.set(item.id, init ? { ...init, ...item } : item);
        });
        return Array.from(map.values());
      }
      return INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartRestaurantId, setCartRestaurantId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CART_REST) || null;
  });

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDER) || 'ORD-MLT-8491';
  });

  const [view, setView] = useState<'explore' | 'restaurant-detail' | 'track-order' | 'owner-dashboard' | 'admin-dashboard'>('explore');
  const [selectedOwnerRestaurantId, setSelectedOwnerRestaurantId] = useState<string>('rest-shahjahan-grill');

  // Sync RTL and lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_KEYS.LANG, language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(STORAGE_KEYS.ROLE, newRole);
    if (newRole === 'restaurant_owner') {
      setView('owner-dashboard');
    } else if (newRole === 'admin') {
      setView('admin-dashboard');
    } else {
      if (view === 'owner-dashboard' || view === 'admin-dashboard') {
        setView('explore');
      }
    }
  };

  // Sync states to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESTS, JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    if (cartRestaurantId) {
      localStorage.setItem(STORAGE_KEYS.CART_REST, cartRestaurantId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CART_REST);
    }
  }, [cart, cartRestaurantId]);

  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDER, activeOrderId);
    }
  }, [activeOrderId]);

  // Cart operations
  const addToCart = (
    item: MenuItem,
    quantity: number = 1,
    selectedOptions?: Record<string, string>,
    priceDelta: number = 0
  ) => {
    if (cart.length > 0 && cartRestaurantId && cartRestaurantId !== item.restaurantId) {
      const conflicting = restaurants.find(r => r.id === cartRestaurantId);
      return { success: false, conflictingRestaurant: conflicting };
    }

    const optionsKey = selectedOptions ? JSON.stringify(selectedOptions) : 'default';
    const cartItemId = `${item.id}-${optionsKey}`;

    setCart(prev => {
      const existingIdx = prev.findIndex(ci => ci.cartItemId === cartItemId);
      if (existingIdx > -1) {
        const next = [...prev];
        const newQty = next[existingIdx].quantity + quantity;
        const basePrice = next[existingIdx].menuItem.pricePKR + next[existingIdx].selectedOptionsPriceDelta;
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: newQty,
          itemTotal: basePrice * newQty,
        };
        return next;
      } else {
        const unitPrice = item.pricePKR + priceDelta;
        const newItem: CartItem = {
          cartItemId,
          menuItem: item,
          quantity,
          selectedOptions,
          selectedOptionsPriceDelta: priceDelta,
          itemTotal: unitPrice * quantity,
        };
        return [...prev, newItem];
      }
    });

    setCartRestaurantId(item.restaurantId);
    return { success: true };
  };

  const forceAddToCartAndClear = (
    item: MenuItem,
    quantity: number = 1,
    selectedOptions?: Record<string, string>,
    priceDelta: number = 0
  ) => {
    const optionsKey = selectedOptions ? JSON.stringify(selectedOptions) : 'default';
    const cartItemId = `${item.id}-${optionsKey}`;
    const unitPrice = item.pricePKR + priceDelta;
    const newItem: CartItem = {
      cartItemId,
      menuItem: item,
      quantity,
      selectedOptions,
      selectedOptionsPriceDelta: priceDelta,
      itemTotal: unitPrice * quantity,
    };
    setCart([newItem]);
    setCartRestaurantId(item.restaurantId);
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      const idx = prev.findIndex(ci => ci.cartItemId === cartItemId);
      if (idx === -1) return prev;
      const target = prev[idx];
      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        const filtered = prev.filter(ci => ci.cartItemId !== cartItemId);
        if (filtered.length === 0) {
          setCartRestaurantId(null);
        }
        return filtered;
      }
      const next = [...prev];
      const unitPrice = target.menuItem.pricePKR + target.selectedOptionsPriceDelta;
      next[idx] = {
        ...target,
        quantity: newQty,
        itemTotal: unitPrice * newQty,
      };
      return next;
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => {
      const filtered = prev.filter(ci => ci.cartItemId !== cartItemId);
      if (filtered.length === 0) {
        setCartRestaurantId(null);
      }
      return filtered;
    });
  };

  const clearCart = () => {
    setCart([]);
    setCartRestaurantId(null);
  };

  const cartSubtotal = cart.reduce((acc, ci) => acc + ci.itemTotal, 0);
  const activeRestaurant = restaurants.find(r => r.id === cartRestaurantId);
  const cartDeliveryFee = activeRestaurant ? activeRestaurant.deliveryFeePKR : 150;
  const cartTotal = cart.length > 0 ? cartSubtotal + cartDeliveryFee : 0;

  // Order management
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `ORD-MLT-${randomSuffix}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setOrders(prev => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);
    clearCart();
    setView('track-order');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  // Owner Operations
  const toggleItemAvailability = (itemId: string) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems(prev =>
      prev.map(i => (i.id === item.id ? item : i))
    );
  };

  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [item, ...prev]);
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateRestaurantSettings = (updated: Partial<Restaurant> & { id: string }) => {
    setRestaurants(prev =>
      prev.map(r => (r.id === updated.id ? { ...r, ...updated } : r))
    );
  };

  // Admin operations
  const toggleVerifyRestaurant = (restaurantId: string) => {
    setRestaurants(prev =>
      prev.map(r => (r.id === restaurantId ? { ...r, isVerified: !r.isVerified } : r))
    );
  };

  const togglePublishRestaurant = (restaurantId: string) => {
    setRestaurants(prev =>
      prev.map(r => (r.id === restaurantId ? { ...r, isPublished: !r.isPublished } : r))
    );
  };

  const toggleFeaturedRestaurant = (restaurantId: string) => {
    setRestaurants(prev =>
      prev.map(r => (r.id === restaurantId ? { ...r, isFeatured: !r.isFeatured } : r))
    );
  };

  const addRestaurant = (newRest: Restaurant) => {
    setRestaurants(prev => [newRest, ...prev]);
  };

  const importRestaurantsFromCSV = (csvText: string) => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        return { added: 0, error: 'CSV file contains no records.' };
      }
      let added = 0;
      const newItems: Restaurant[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Simple CSV splitter
        const parts = line.split(',');
        if (parts.length >= 7) {
          const id = parts[0]?.trim() || `rest-${Date.now()}-${i}`;
          const name = parts[1]?.replace(/"/g, '').trim();
          const nameUr = parts[2]?.replace(/"/g, '').trim() || name;
          const neighbourhood = (parts[3]?.replace(/"/g, '').trim() || 'Gulgasht Colony') as any;
          const address = parts[4]?.replace(/"/g, '').trim();
          const phone = parts[5]?.replace(/"/g, '').trim();
          const whatsapp = parts[6]?.replace(/"/g, '').trim();
          const minOrder = parseInt(parts[8]?.trim() || '500', 10);
          const fee = parseInt(parts[9]?.trim() || '150', 10);

          if (name) {
            newItems.push({
              id,
              name,
              nameUr,
              tagline: `Authentic taste in ${neighbourhood}`,
              taglineUr: `${neighbourhood} کا مشہور اور لذیذ ذائقہ`,
              slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=160&auto=format&fit=crop&q=80',
              coverImage: INITIAL_RESTAURANTS[0].coverImage,
              neighbourhood,
              address: address || `${neighbourhood}, Multan`,
              addressUr: `${neighbourhood}، ملتان`,
              phone: phone || '+92 61 1112223',
              whatsapp: whatsapp || '923001234567',
              mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(name + ' ' + neighbourhood + ' Multan')}`,
              rating: 4.5,
              reviewCount: 20,
              deliveryTimeMin: 30,
              deliveryTimeMax: 45,
              deliveryFeePKR: isNaN(fee) ? 150 : fee,
              minOrderPKR: isNaN(minOrder) ? 500 : minOrder,
              isVerified: true,
              isPublished: true,
              isFeatured: false,
              acceptingOrders: true,
              cuisines: ['desi'],
              ownerEmail: 'owner@multanfood.pk',
              openingHours: '12:00 PM - 12:00 AM',
            });
            added++;
          }
        }
      }

      if (newItems.length > 0) {
        setRestaurants(prev => {
          const map = new Map<string, Restaurant>();
          prev.forEach(r => map.set(r.id, r));
          newItems.forEach(r => map.set(r.id, r));
          return Array.from(map.values());
        });
      }

      return { added };
    } catch (err: any) {
      return { added: 0, error: err.message || 'Failed to parse CSV.' };
    }
  };

  const exportRestaurantsCSV = () => {
    const headers = 'id,name,name_ur,branch,neighbourhood,address,phone,whatsapp,price_range,website,order_url,last_verified,min_order_pkr,delivery_fee_pkr,is_verified,is_published\n';
    const rows = restaurants
      .map(
        r =>
          `"${r.id}","${r.name.replace(/"/g, '""')}","${(r.nameUr || '').replace(/"/g, '""')}","${(r.branchName || '').replace(/"/g, '""')}","${r.neighbourhood}","${r.address.replace(/"/g, '""')}","${r.phone}","${r.whatsapp}","${r.priceRange || ''}","${r.websiteUrl || r.officialWebsite || ''}","${r.onlineOrderUrl || ''}","${r.lastVerifiedDate || ''}",${r.minOrderPKR},${r.deliveryFeePKR},${r.isVerified},${r.isPublished}`
      )
      .join('\n');
    return headers + rows;
  };

  const exportRestaurantsJSON = () => {
    return JSON.stringify(restaurants, null, 2);
  };

  const exportMenuItemsCSV = () => {
    const headers = 'id,restaurant_id,name,name_ur,category,price_pkr,original_price_pkr,deal_badge,pizza_size,burger_type,is_available,verified_price,updated_at,order_url,description\n';
    const rows = menuItems
      .map(
        item =>
          `"${item.id}","${item.restaurantId}","${item.name.replace(/"/g, '""')}","${(item.nameUr || '').replace(/"/g, '""')}","${item.category}",${item.pricePKR},${item.originalPricePKR || ''},"${item.dealBadge || ''}","${item.pizzaSize || ''}","${item.burgerType || ''}",${item.isAvailable},${!!item.verifiedPrice},"${item.updatedAt || ''}","${item.orderUrl || ''}","${(item.description || '').replace(/"/g, '""')}"`
      )
      .join('\n');
    return headers + rows;
  };

  const exportMenuItemsJSON = () => {
    return JSON.stringify(menuItems, null, 2);
  };

  const exportFullDatabaseJSON = () => {
    return JSON.stringify(
      {
        database: 'Best Food In Multan - Verified Restaurant & Price Directory',
        city: 'Multan, Punjab, Pakistan',
        exportedAt: new Date().toISOString(),
        version: '2.5.0',
        statistics: {
          totalRestaurants: restaurants.length,
          totalMenuItems: menuItems.length,
          totalPizzas: menuItems.filter(i => i.category === 'pizza' || i.pizzaSize).length,
          totalBurgers: menuItems.filter(i => i.category === 'burgers' || i.burgerType).length,
        },
        restaurants,
        menuItems,
      },
      null,
      2
    );
  };

  const resetDatabaseToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.RESTS);
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    setRestaurants(INITIAL_RESTAURANTS);
    setMenuItems(INITIAL_MENU_ITEMS);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        role,
        setRole,
        restaurants,
        menuItems,
        orders,
        cart,
        cartRestaurantId,
        selectedRestaurantId,
        setSelectedRestaurantId,
        activeOrderId,
        setActiveOrderId,
        view,
        setView,
        selectedOwnerRestaurantId,
        setSelectedOwnerRestaurantId,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        forceAddToCartAndClear,
        cartSubtotal,
        cartDeliveryFee,
        cartTotal,
        createOrder,
        updateOrderStatus,
        toggleItemAvailability,
        updateMenuItem,
        addMenuItem,
        deleteMenuItem,
        updateRestaurantSettings,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
