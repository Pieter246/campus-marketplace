// Firestore Database Initialization Script
// Run this to create initial collections and data

import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Initial Categories Data
const initialCategories = [
  {
    categoryName: 'textbooks',
    categoryDescription: 'Academic textbooks and course materials',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    categoryName: 'books',
    categoryDescription: 'General books and literature',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    categoryName: 'electronics',
    categoryDescription: 'Laptops, phones, tablets, and electronic devices',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    categoryName: 'furniture',
    categoryDescription: 'Dorm and apartment furniture',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    categoryName: 'study_materials',
    categoryDescription: 'Notes, study guides, and academic resources',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    categoryName: 'other',
    categoryDescription: 'Other miscellaneous items',
    isActive: true,
    createdAt: serverTimestamp()
  }
];

// Initialize Database Function
export async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // 1. Create Categories Collection
    console.log('Creating categories...');
    for (const category of initialCategories) {
      const categoryRef = await addDoc(collection(db, 'categories'), category);
      console.log(`Created category: ${category.categoryName} (${categoryRef.id})`);
    }

    // 2. Create collections with proper field structures
    console.log('Creating collections with field structures...');
    
    // Create sample documents to establish field structures
    const sampleUserId = 'sample-user-' + Date.now();
    
    // Users collection structure
    await setDoc(doc(db, 'users', sampleUserId), {
      userId: sampleUserId,
      firstName: 'Sample',
      lastName: 'User',
      email: 'sample@example.com',
      phoneNumber: '+27123456789',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      emailVerified: false,
      isAdmin: false
    });
    console.log('Created collection: users (with field structure)');

    // User Profiles collection structure
    await setDoc(doc(db, 'userProfiles', sampleUserId), {
      userId: sampleUserId,
      profilePictureUrl: null,
      bio: '',
      preferredContactMethod: 'email',
      campusLocation: '',
      studentNumber: '',
      yearOfStudy: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Created collection: userProfiles (with field structure)');

    // Items collection structure
    const sampleItemId = 'sample-item-' + Date.now();
    await setDoc(doc(db, 'items', sampleItemId), {
      itemId: sampleItemId,
      sellerId: sampleUserId,
      categoryId: 'textbooks',
      title: 'Sample Item',
      description: 'Sample description',
      price: 0,
      condition: 'new',
      itemStatus: 'available',
      collectionAddress: '',
      collectionInstructions: '',
      postedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      viewsCount: 0
    });
    console.log('Created collection: items (with field structure)');

    // Item Photos collection structure
    await addDoc(collection(db, 'itemPhotos'), {
      photoId: 'sample-photo-' + Date.now(),
      itemId: sampleItemId,
      photoUrl: '',
      photoOrder: 1,
      uploadedAt: serverTimestamp()
    });
    console.log('Created collection: itemPhotos (with field structure)');

    // Carts collection structure
    await setDoc(doc(db, 'carts', sampleUserId), {
      cartId: sampleUserId,
      buyerId: sampleUserId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Created collection: carts (with field structure)');

    // Cart Items collection structure
    await addDoc(collection(db, 'cartItems'), {
      cartItemId: 'sample-cart-item-' + Date.now(),
      cartId: sampleUserId,
      itemId: sampleItemId,
      quantity: 1,
      addedAt: serverTimestamp()
    });
    console.log('Created collection: cartItems (with field structure)');

    // Orders collection structure
    const sampleOrderId = 'sample-order-' + Date.now();
    await setDoc(doc(db, 'orders', sampleOrderId), {
      orderId: sampleOrderId,
      buyerId: sampleUserId,
      sellerId: sampleUserId,
      orderStatus: 'pending',
      orderTotal: 0,
      deliveryCost: 0,
      collectionAddress: '',
      collectionInstructions: '',
      orderDate: serverTimestamp(),
      completionDate: null,
      notes: ''
    });
    console.log('Created collection: orders (with field structure)');

    // Order Items collection structure
    await addDoc(collection(db, 'orderItems'), {
      orderItemId: 'sample-order-item-' + Date.now(),
      orderId: sampleOrderId,
      itemId: sampleItemId,
      quantity: 1,
      priceAtPurchase: 0,
      itemTotal: 0
    });
    console.log('Created collection: orderItems (with field structure)');

    // Payments collection structure
    await addDoc(collection(db, 'payments'), {
      paymentId: 'sample-payment-' + Date.now(),
      orderId: sampleOrderId,
      paymentMethod: 'credit_card',
      paymentStatus: 'pending',
      paymentAmount: 0,
      transactionReference: '',
      paymentDate: serverTimestamp(),
      gatewayResponse: {}
    });
    console.log('Created collection: payments (with field structure)');

    // Messages collection structure
    await addDoc(collection(db, 'messages'), {
      messageId: 'sample-message-' + Date.now(),
      senderId: sampleUserId,
      receiverId: sampleUserId,
      itemId: sampleItemId,
      subject: '',
      messageContent: '',
      sentAt: serverTimestamp(),
      readAt: null,
      messageType: 'general'
    });
    console.log('Created collection: messages (with field structure)');

    console.log('Database initialization complete!');
    console.log('Collections created:');
    console.log('  - categories (with initial data)');
    console.log('  - users, userProfiles, items, itemPhotos');
    console.log('  - carts, cartItems, orders, orderItems');
    console.log('  - payments, messages');

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Sample Data Creation (for testing and establishing field structures)
export async function createSampleData() {
  try {
    console.log('Creating sample data with full field structures...');

    // Sample user document structure
    const sampleUserId = 'sample-user-id';
    await setDoc(doc(db, 'users', sampleUserId), {
      userId: sampleUserId,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phoneNumber: '+27123456789',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      emailVerified: true,
      isAdmin: false
    });

    // Sample user profile
    await setDoc(doc(db, 'userProfiles', sampleUserId), {
      userId: sampleUserId,
      profilePictureUrl: null,
      bio: 'Computer Science student looking to buy and sell textbooks',
      preferredContactMethod: 'email',
      campusLocation: 'Main Campus',
      studentNumber: 'CS2023001',
      yearOfStudy: 2,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Sample cart
    await setDoc(doc(db, 'carts', sampleUserId), {
      cartId: sampleUserId,
      buyerId: sampleUserId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Sample item
    const sampleItemId = 'sample-item-id';
    await setDoc(doc(db, 'items', sampleItemId), {
      itemId: sampleItemId,
      sellerId: sampleUserId,
      categoryId: 'textbooks',
      title: 'Introduction to Computer Science Textbook',
      description: 'Excellent condition CS101 textbook. Used for one semester only.',
      price: 450.00,
      condition: 'like_new',
      itemStatus: 'available',
      collectionAddress: 'Main Campus Library',
      collectionInstructions: 'Meet at the front desk during library hours',
      postedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      viewsCount: 0
    });

    // Sample item photo
    await addDoc(collection(db, 'itemPhotos'), {
      photoId: 'sample-photo-id',
      itemId: sampleItemId,
      photoUrl: 'https://example.com/sample-photo.jpg',
      photoOrder: 1,
      uploadedAt: serverTimestamp()
    });

    // Sample cart item
    await addDoc(collection(db, 'cartItems'), {
      cartItemId: 'sample-cart-item-id',
      cartId: sampleUserId,
      itemId: sampleItemId,
      quantity: 1,
      addedAt: serverTimestamp()
    });

    // Sample order
    const sampleOrderId = 'sample-order-id';
    await setDoc(doc(db, 'orders', sampleOrderId), {
      orderId: sampleOrderId,
      buyerId: 'sample-buyer-id',
      sellerId: sampleUserId,
      orderStatus: 'pending',
      orderTotal: 450.00,
      deliveryCost: 0,
      collectionAddress: 'Main Campus Library',
      collectionInstructions: 'Meet at the front desk during library hours',
      orderDate: serverTimestamp(),
      completionDate: null,
      notes: 'Please bring student ID for verification'
    });

    // Sample order item
    await addDoc(collection(db, 'orderItems'), {
      orderItemId: 'sample-order-item-id',
      orderId: sampleOrderId,
      itemId: sampleItemId,
      quantity: 1,
      priceAtPurchase: 450.00,
      itemTotal: 450.00
    });

    // Sample payment
    await addDoc(collection(db, 'payments'), {
      paymentId: 'sample-payment-id',
      orderId: sampleOrderId,
      paymentMethod: 'credit_card',
      paymentStatus: 'pending',
      paymentAmount: 450.00,
      transactionReference: 'TXN_123456789',
      paymentDate: serverTimestamp(),
      gatewayResponse: {
        status: 'initiated',
        reference: 'PF_123456789',
        provider: 'payfast'
      }
    });

    // Sample message
    await addDoc(collection(db, 'messages'), {
      messageId: 'sample-message-id',
      senderId: 'sample-buyer-id',
      receiverId: sampleUserId,
      itemId: sampleItemId,
      subject: 'Question about textbook condition',
      messageContent: 'Hi! Is this textbook still available? Can I see more photos?',
      sentAt: serverTimestamp(),
      readAt: null,
      messageType: 'inquiry'
    });

    console.log('Sample data with full field structures created');

  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  }
}
