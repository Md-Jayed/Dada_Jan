export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  stockQty: number;
  images: string[];
  videoUrl: string;
  certificationStatus: {
    imamVerified: boolean;
    labTested: boolean;
    certifiedAuthentic: boolean;
  };
  origin: string;
  ingredients: string;
  description: string;
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  status?: 'Draft' | 'Published';
  salePrice?: number;
}

export interface Category {
  id: string;
  name: string;
  bnName: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'Percentage' | 'Fixed';
  amount: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  expiresDate?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  customerAddress: string;
  district: string;
  area: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  referralCode?: string;
  status: 'Placed' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered';
  paymentMethod: 'Cash on Delivery' | 'bKash' | 'Nagad' | 'Bank Transfer';
  paymentStatus: 'Pending' | 'Paid';
  date: string;
  assignedPartnerId?: string; // assigned dealer
  commissionsCalculated: boolean;
}

export interface Partner {
  id: string;
  name: string;
  bengaliName: string;
  role: 'Imam' | 'Dealer' | 'Local Partner';
  mobile: string;
  email: string;
  password?: string; // Optional password for email/password login
  referralCode: string;
  district: string;
  area: string;
  verifiedStatus: 'Pending' | 'Approved' | 'Suspended' | 'Rejected';
  nidPhoto: string;
  walletBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  rating?: number;
}

export interface Withdrawal {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerRole: string;
  mobile: string;
  amount: number;
  method: 'bKash' | 'Nagad' | 'Bank Account';
  details: string; // Account/Number
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

export interface AppNotification {
  id: string;
  type: 'Order' | 'Commission' | 'Payout' | 'Inquiry';
  targetRole: 'Admin' | 'Partner';
  partnerId?: string; // If for partner
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  password?: string; // Optional password for email/password login
  district: string;
  area: string;
  address: string;
  referredBy?: string; // Referral code
  joinDate: string;
}
