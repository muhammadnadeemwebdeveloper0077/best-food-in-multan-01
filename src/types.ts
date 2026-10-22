export type Language = 'en' | 'ur';

export type UserRole = 'customer' | 'restaurant_owner' | 'admin';

export type CuisineCategory =
  | 'all'
  | 'deals'
  | 'karahi'
  | 'bbq'
  | 'biryani'
  | 'pizza'
  | 'burgers'
  | 'fast_food'
  | 'desi'
  | 'sohan_halwa'
  | 'beverages';

export type MultanNeighbourhood =
  | 'All Areas'
  | 'Gulgasht Colony'
  | 'Bosan Road'
  | 'Multan Cantt'
  | 'Shah Rukn-e-Alam Colony'
  | 'Chowk Kutchery'
  | 'Nishtar Road'
  | 'DHA Multan'
  | 'Model Town'
  | 'Mumtazabad'
  | 'Northern Bypass'
  | 'Old City (Ghanta Ghar)'
  | 'New Multan'
  | 'Wapda Town'
  | 'Shalimar Colony';

export interface MenuItemOption {
  name: string;
  nameUr?: string;
  choices: {
    label: string;
    labelUr?: string;
    priceDelta: number;
  }[];
}

export type PizzaSize = 'small' | 'medium' | 'large' | 'family' | 'monster_slice';
export type BurgerType = 'chicken' | 'zinger' | 'beef' | 'cheese' | 'egg_shami';

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  nameUr: string;
  description: string;
  descriptionUr: string;
  pricePKR: number;
  category: CuisineCategory;
  image: string;
  isAvailable: boolean;
  isSpicy?: boolean;
  isSpeciality?: boolean;
  preparationTimeMin: number;
  options?: MenuItemOption[];
  dealBadge?: string;
  originalPricePKR?: number;
  pizzaSize?: PizzaSize;
  burgerType?: BurgerType;
  verifiedPrice?: boolean;
  updatedAt?: string;
  orderUrl?: string;
  menuUrl?: string;
}

export interface HeritageStory {
  establishedYear: number;
  founder: string;
  founderUr: string;
  vintageImageUrl: string;
  modernImageUrl: string;
  storyEn: string;
  storyUr: string;
}

export interface Restaurant {
  id: string;
  name: string;
  nameUr: string;
  tagline: string;
  taglineUr: string;
  slug: string;
  logo: string;
  coverImage: string;
  neighbourhood: MultanNeighbourhood;
  address: string;
  addressUr: string;
  phone: string;
  whatsapp: string;
  mapsUrl: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFeePKR: number;
  minOrderPKR: number;
  isVerified: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  acceptingOrders: boolean;
  cuisines: CuisineCategory[];
  ownerEmail: string;
  openingHours: string;
  websiteUrl?: string;
  branchName?: string;
  branchNameUr?: string;
  officialWebsite?: string;
  onlineOrderUrl?: string;
  menuUrl?: string;
  lastVerifiedDate?: string;
  priceRange?: string;
  priceRangeUr?: string;
  liveDealsUrl?: string;
  activeDealBanner?: string;
  activeDealBannerUr?: string;
  pastStory?: HeritageStory;
  gallery?: {
    id: string;
    title: string;
    titleUr: string;
    period: 'past' | 'live';
    imageUrl: string;
    caption: string;
    captionUr: string;
    sourceTag?: string;
  }[];
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions?: Record<string, string>;
  selectedOptionsPriceDelta: number;
  itemTotal: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNeighbourhood: MultanNeighbourhood;
  customerAddress: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotalPKR: number;
  deliveryFeePKR: number;
  totalPKR: number;
  paymentMethod: 'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer';
  status: OrderStatus;
  specialInstructions?: string;
  createdAt: string;
  estimatedDeliveryMins: number;
}

export interface CustomerAuth {
  isLoggedIn: boolean;
  email: string;
  name: string;
  phone: string;
  savedNeighbourhood: MultanNeighbourhood;
  savedAddress: string;
}
