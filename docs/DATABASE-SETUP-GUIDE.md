# Database Setup Guide

## How to Create Database Structures in Firestore

You have **3 ways** to create your database structures:

### **Method 1: Automatic Setup via API (Recommended)**

1. **Start your development server:**
```bash
npm run dev
```

2. **Initialize the database:**
```bash
# Using curl
curl -X POST http://localhost:3000/api/setup-database \
  -H "Content-Type: application/json" \
  -d '{"action": "initialize"}'

# Or visit in browser and use browser console:
# fetch('/api/setup-database', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({action: 'initialize'}) })
```

3. **Create sample data (optional):**
```bash
curl -X POST http://localhost:3000/api/setup-database \
  -H "Content-Type: application/json" \
  -d '{"action": "sample-data"}'
```

### **Method 2: Manual via Firebase Console**

1. **Go to Firebase Console:**
   - Visit [console.firebase.google.com](https://console.firebase.google.com)
   - Select your project: `campus-market-place-3f978`

2. **Navigate to Firestore:**
   - Click "Firestore Database"
   - Click "Start collection"

3. **Create collections manually:**
   - `categories` - Add the 6 categories (textbooks, books, electronics, furniture, study_materials, other)
   - `users` - Will be populated via Firebase Auth
   - `userProfiles` - Create as needed
   - `items` - Will be populated when users create listings
   - And so on...

### **Method 3: Import Data via Firebase CLI**

1. **Create data files and import:**
```bash
# Install Firebase CLI if not already done
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Import data (once you have export files)
firebase firestore:import ./data-export
```

## Security Rules Setup

**Deploy your Firestore security rules:**

1. **The rules are already created** in `firestore.rules`

2. **Deploy them:**
```bash
firebase deploy --only firestore:rules
```

## Database Collections Created

When you run the initialization, these collections will be created:

### **Core Collections:**
- **categories** (with initial 6 categories)
- **users** (populated via Firebase Auth)
- **userProfiles** (extended user info)
- **items** (marketplace listings)
- **itemPhotos** (item images)

### **Transaction Collections:**
- **carts** (user shopping carts)
- **cartItems** (items in carts)
- **orders** (purchase orders)
- **orderItems** (items in orders)
- **payments** (payment records)

### **Communication:**
- **messages** (user-to-user messaging)

## Quick Start (Recommended Flow)

1. **Run the development server:**
```bash
npm run dev
```

2. **Open browser to:** `http://localhost:3000`

3. **Initialize database via browser console:**
```javascript
fetch('/api/setup-database', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({action: 'initialize'})
}).then(r => r.json()).then(console.log)
```

4. **Check Firebase Console** to see your collections

5. **Deploy security rules:**
```bash
firebase deploy --only firestore:rules
```

## Verification

After setup, you should see in Firebase Console:
- 11 collections created
- 6 categories with data
- Security rules deployed
- Ready for user registration and item creation

## Next Steps

1. **Set up Firebase Authentication** (enable Email/Password)
2. **Create user registration flow**
3. **Build item listing functionality**
4. **Test the complete flow**

The database structure matches your normalized design perfectly!
