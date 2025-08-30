# Item Management API Documentation

## Overview
These APIs handle item creation, editing, deletion, and listing management in the Campus Marketplace.

## Authentication
All endpoints require Firebase Authentication. Include the Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### 1. Create New Item
**POST** `/api/items/create`

Creates a new item listing.

**Request Body:**
```json
{
  "title": "Introduction to Economics Textbook",
  "description": "Excellent condition, used for one semester only",
  "price": 1200,
  "categoryId": "textbooks",
  "condition": "like_new",
  "collectionAddress": "Main Campus Library",
  "collectionInstructions": "Meet at front desk during library hours"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item created successfully",
  "item": {
    "itemId": "generated-item-id",
    "title": "Introduction to Economics Textbook",
    "price": 1200,
    "itemStatus": "available",
    "postedAt": "2025-08-28T10:30:00Z"
  }
}
```

---

### 2. Get My Items
**GET** `/api/items/my-items`

Returns all items listed by the authenticated user.

**Response (200):**
```json
{
  "success": true,
  "items": [
    {
      "itemId": "item-1",
      "title": "Introduction to Economics",
      "description": "Excellent condition textbook",
      "price": 1200,
      "categoryId": "textbooks",
      "condition": "like_new",
      "itemStatus": "available",
      "sellerId": "user-id",
      "viewsCount": 15,
      "postedAt": "2025-08-28T10:30:00Z",
      "updatedAt": "2025-08-28T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

### 3. Get All Items (Marketplace)
**GET** `/api/items`

Returns items for marketplace browsing with filtering options.

**Query Parameters:**
- `category` - Filter by category ID
- `search` - Search in title and description
- `status` - Item status (default: "available")
- `limit` - Number of items to return (default: 20)

**Example Request:**
```
GET /api/items?category=textbooks&search=economics&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "items": [
    {
      "itemId": "item-1",
      "title": "Introduction to Economics",
      "price": 1200,
      "categoryId": "textbooks",
      "condition": "like_new",
      "itemStatus": "available",
      "sellerId": "user-id",
      "viewsCount": 15,
      "postedAt": "2025-08-28T10:30:00Z"
    }
  ],
  "count": 1,
  "filters": {
    "category": "textbooks",
    "search": "economics",
    "status": "available"
  }
}
```

---

### 4. Get Single Item
**GET** `/api/items/[itemId]`

Returns detailed information for a specific item.

**Response (200):**
```json
{
  "success": true,
  "item": {
    "itemId": "item-1",
    "title": "Introduction to Economics",
    "description": "Excellent condition textbook used for one semester",
    "price": 1200,
    "categoryId": "textbooks",
    "condition": "like_new",
    "itemStatus": "available",
    "sellerId": "user-id",
    "collectionAddress": "Main Campus Library",
    "collectionInstructions": "Meet at front desk",
    "viewsCount": 15,
    "postedAt": "2025-08-28T10:30:00Z",
    "updatedAt": "2025-08-28T10:30:00Z"
  }
}
```

---

### 5. Update Item
**PUT** `/api/items/[itemId]`

Updates an existing item (only owner can update).

**Request Body (all fields optional):**
```json
{
  "title": "Updated Economics Textbook",
  "description": "Updated description",
  "price": 1000,
  "condition": "good",
  "itemStatus": "sold",
  "collectionAddress": "Updated address",
  "collectionInstructions": "Updated instructions"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Item updated successfully",
  "updatedFields": ["title", "price", "itemStatus"]
}
```

---

### 6. Delete Item
**DELETE** `/api/items/[itemId]`

Deletes an item (only owner can delete).

**Response (200):**
```json
{
  "success": true,
  "message": "Item deleted successfully",
  "itemId": "item-1"
}
```

## Database Schema

### Items Collection (`items/{itemId}`)
```json
{
  "sellerId": "string",
  "categoryId": "string",
  "title": "string",
  "description": "string",
  "price": "number",
  "condition": "new|like_new|good|fair|poor",
  "itemStatus": "available|sold|reserved|inactive",
  "collectionAddress": "string",
  "collectionInstructions": "string",
  "postedAt": "timestamp",
  "updatedAt": "timestamp",
  "viewsCount": "number"
}
```

## Item Status Values
- **available**: Item is active and for sale
- **sold**: Item has been sold
- **reserved**: Item is reserved for a buyer
- **inactive**: Item is temporarily not for sale

## Condition Values
- **new**: Brand new item
- **like_new**: Excellent condition, barely used
- **good**: Good condition with minor wear
- **fair**: Acceptable condition with noticeable wear
- **poor**: Heavy wear but still functional

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden: You can only edit your own items"
}
```

### 404 Not Found
```json
{
  "message": "Item not found"
}
```

### 400 Bad Request
```json
{
  "message": "Missing required fields or invalid price"
}
```

## Usage Examples

### Frontend Integration

```typescript
// Create new item
const createItem = async (itemData: CreateItemRequest) => {
  const idToken = await user.getIdToken()
  
  const response = await fetch('/api/items/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify(itemData)
  })
  
  return response.json()
}

// Get user's items
const getMyItems = async () => {
  const idToken = await user.getIdToken()
  
  const response = await fetch('/api/items/my-items', {
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  })
  
  return response.json()
}

// Update item
const updateItem = async (itemId: string, updates: UpdateItemRequest) => {
  const idToken = await user.getIdToken()
  
  const response = await fetch(`/api/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify(updates)
  })
  
  return response.json()
}

// Delete item
const deleteItem = async (itemId: string) => {
  const idToken = await user.getIdToken()
  
  const response = await fetch(`/api/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  })
  
  return response.json()
}

// Browse marketplace items
const getMarketplaceItems = async (filters?: {
  category?: string
  search?: string
  limit?: number
}) => {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.limit) params.append('limit', filters.limit.toString())
  
  const response = await fetch(`/api/items?${params}`)
  return response.json()
}
```
