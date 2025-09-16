// TypeScript types based on Firestore collections

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  emailVerified: boolean;
  isAdmin: boolean;
}

export interface UserProfile {
  userId: string;
  profilePictureUrl?: string;
  bio?: string;
  preferredContactMethod: 'email' | 'phone' | 'message';
  campusLocation: string;
  studentNumber: string;
  yearOfStudy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  categoryId: string;
  categoryName: 'textbooks' | 'books' | 'electronics' | 'furniture' | 'study_materials' | 'other';
  categoryDescription: string;
  isActive: boolean;
  createdAt: Date;
}

// export interface Item {
//   itemId: string;
//   sellerId: string;
//   categoryId: string;
//   title: string;
//   description: string;
//   price: number;
//   condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
//   itemStatus: 'available' | 'sold' | 'pending' | 'removed';
//   collectionAddress: string;
//   collectionInstructions?: string;
//   postedAt: Date;
//   updatedAt: Date;
//   viewsCount: number;
// }

// Meiring se item
export interface Item {
  itemId: string;
  sellerId: string;
  category: "books" | "electronics" | "clothing"; //changed categoryId: string;
  title: string;
  description: string;
  price: number;
  condition: "new" | "used" | "fair" | "poor"; // changed condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  status: "draft" | "pending" | "for-sale" | "sold" | "withdrawn"; // changed itemStatus: 'available' | 'sold' | 'pending' | 'removed';
  collectionAddress: string;
  //collectionInstructions?: string;
  postedAt?: Date;
  updatedAt?: Date;
  viewsCount?: number;
  images?: string[];
}

export interface ItemPhoto {
  photoId: string;
  itemId: string;
  photoUrl: string;
  photoOrder: number;
  uploadedAt: Date;
}

export interface Cart {
  cartId: string;
  buyerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  cartItemId: string;
  cartId: string;
  itemId: string;
  quantity: number;
  addedAt: Date;
}

export interface Order {
  orderId: string;
  buyerId: string;
  sellerId: string;
  orderStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  orderTotal: number;
  deliveryCost: number;
  collectionAddress: string;
  collectionInstructions?: string;
  orderDate: Date;
  completionDate?: Date;
  notes?: string;
}

export interface OrderItem {
  orderItemId: string;
  orderId: string;
  itemId: string;
  quantity: number;
  priceAtPurchase: number;
  itemTotal: number;
}

export interface Payment {
  paymentId: string;
  orderId: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'instant_eft' | 'snapcan';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentAmount: number;
  transactionReference: string;
  paymentDate: Date;
  gatewayResponse?: Record<string, unknown>;
}

export interface Message {
  messageId: string;
  senderId: string;
  receiverId: string;
  itemId?: string;
  subject: string;
  messageContent: string;
  sentAt: Date;
  readAt?: Date;
  messageType: 'inquiry' | 'negotiation' | 'arrangement' | 'general';
}

// Helper types
export interface ItemWithDetails extends Item {
  seller: User;
  //category: Category;
  photos: ItemPhoto[];
}

export interface CartItemWithDetails extends CartItem {
  item: ItemWithDetails;
}

export interface OrderWithDetails extends Order {
  buyer: User;
  seller: User;
  items: (OrderItem & { item: Item })[];
  payments: Payment[];
}
