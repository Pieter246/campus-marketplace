# Campus Marketplace API Documentation

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Admin APIs](#admin-apis)
4. [Item APIs](#item-apis)
5. [Cart APIs](#cart-apis)
6. [Order APIs](#order-apis)
7. [Messaging APIs](#messaging-apis)
8. [Photo APIs](#photo-apis)
9. [Search APIs](#search-apis)
10. [Category APIs](#category-apis)

---

## Authentication APIs

### POST `/api/auth/login`
**Purpose**: User login with email and password  
**Authentication**: None required  
**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "uid": "string",
    "email": "string",
    "displayName": "string"
  },
  "token": "jwt_token"
}
```

### POST `/api/register`
**Purpose**: Register new user account  
**Authentication**: None required  
**Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string",
  "campusLocation": "string",
  "yearOfStudy": "string"
}
```
**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "string"
}
```

### POST `/api/auth/logout`
**Purpose**: User logout (invalidate session)  
**Authentication**: Required (JWT token)  
**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### POST `/api/auth/reset-password`
**Purpose**: Request password reset email  
**Authentication**: None required  
**Request Body**:
```json
{
  "email": "string"
}
```
**Response**:
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "resetLink": "string" // Only in development mode
}
```

### POST `/api/refresh-token`
**Purpose**: Refresh authentication token  
**Authentication**: Required (refresh token)  
**Response**:
```json
{
  "success": true,
  "token": "new_jwt_token"
}
```

---

## User Management APIs

### GET `/api/users/profile`
**Purpose**: Get current user's complete profile  
**Authentication**: Required (JWT token)  
**Response**:
```json
{
  "success": true,
  "user": {
    "userId": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phoneNumber": "string",
    "isActive": "boolean",
    "emailVerified": "boolean",
    "isAdmin": "boolean",
    "profilePictureUrl": "string",
    "bio": "string",
    "preferredContactMethod": "string",
    "campusLocation": "string",
    "studentNumber": "string",
    "yearOfStudy": "string",
    "createdAt": "ISO_date",
    "updatedAt": "ISO_date"
  }
}
```

### PUT `/api/users/update`
**Purpose**: Update user profile information  
**Authentication**: Required (JWT token)  
**Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "bio": "string",
  "preferredContactMethod": "string",
  "campusLocation": "string",
  "yearOfStudy": "string"
}
```

### POST `/api/users/deactivate`
**Purpose**: Deactivate user account  
**Authentication**: Required (JWT token)  
**Response**:
```json
{
  "success": true,
  "message": "Account deactivated successfully"
}
```

### GET `/api/profiles`
**Purpose**: Get user profile by ID  
**Authentication**: Required (JWT token)  
**Query Parameters**: `userId` (string)  
**Response**: Same as `/api/users/profile`

---

## Admin APIs

### GET `/api/admin/users`
**Purpose**: List all users (admin only)  
**Authentication**: Required (JWT token + Admin permission)  
**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (max: 100, default: 50)
- `search` (string): Search by name/email
- `status` (string): "active", "inactive", or "all"
- `sortBy` (string): "createdAt", "email", "firstName"
- `sortOrder` (string): "asc" or "desc"

**Response**:
```json
{
  "success": true,
  "users": [
    {
      "userId": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "isActive": "boolean",
      "isAdmin": "boolean",
      "createdAt": "ISO_date"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number",
    "hasNext": "boolean",
    "hasPrev": "boolean"
  }
}
```

### PUT `/api/admin/users`
**Purpose**: Update user status/permissions (admin only)  
**Authentication**: Required (JWT token + Admin permission)  
**Request Body**:
```json
{
  "userId": "string",
  "isActive": "boolean",
  "isAdmin": "boolean",
  "action": "activate|deactivate|promote|demote"
}
```

### GET `/api/admin/users/[userId]`
**Purpose**: Get detailed user information (admin only)  
**Authentication**: Required (JWT token + Admin permission)  
**Response**:
```json
{
  "success": true,
  "user": {
    // ... complete user profile
    "firebaseAuth": {
      "emailVerified": "boolean",
      "disabled": "boolean",
      "lastSignInTime": "ISO_date",
      "creationTime": "ISO_date"
    },
    "stats": {
      "itemsListed": "number",
      "ordersMade": "number",
      "messagesSent": "number",
      "messagesReceived": "number"
    }
  }
}
```

### DELETE `/api/admin/users/[userId]`
**Purpose**: Delete user account (admin only)  
**Authentication**: Required (JWT token + Admin permission)  
**Response**:
```json
{
  "success": true,
  "message": "User account deleted successfully",
  "userId": "string"
}
```

---

## Item APIs

### GET `/api/items`
**Purpose**: Get all items with filtering and pagination  
**Authentication**: None required  
**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Filter by category
- `condition` (string): Filter by condition
- `status` (string): Filter by status
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `sellerId` (string): Filter by seller

**Response**:
```json
{
  "success": true,
  "items": [
    {
      "itemId": "string",
      "title": "string",
      "description": "string",
      "price": "number",
      "category": "string",
      "condition": "string",
      "status": "string",
      "imageUrls": ["string"],
      "sellerId": "string",
      "sellerName": "string",
      "createdAt": "ISO_date"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### POST `/api/items`
**Purpose**: Create new item listing  
**Authentication**: Required (JWT token)  
**Request Body**:
```json
{
  "title": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "condition": "string",
  "imageUrls": ["string"]
}
```

### GET `/api/items/[itemId]`
**Purpose**: Get specific item details  
**Authentication**: None required  
**Response**:
```json
{
  "success": true,
  "item": {
    // ... complete item details
    "seller": {
      "sellerId": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    }
  }
}
```

### PUT `/api/items/[itemId]`
**Purpose**: Update item (owner only)  
**Authentication**: Required (JWT token)  
**Request Body**: Same as POST `/api/items`

### DELETE `/api/items/[itemId]`
**Purpose**: Delete item (owner only)  
**Authentication**: Required (JWT token)

### PUT `/api/items/[itemId]/status`
**Purpose**: Update item status  
**Authentication**: Required (JWT token)  
**Request Body**:
```json
{
  "status": "available|sold|reserved|draft"
}
```

---

## Cart APIs

### GET `/api/cart`
**Purpose**: Get user's cart items  
**Authentication**: Required (JWT token)  
**Response**:
```json
{
  "success": true,
  "cart": {
    "cartId": "string",
    "userId": "string",
    "items": [
      {
        "itemId": "string",
        "title": "string",
        "price": "number",
        "imageUrls": ["string"],
        "addedAt": "ISO_date"
      }
    ],
    "totalItems": "number",
    "totalPrice": "number"
  }
}
```

### POST `/api/cart`
**Purpose**: Add item to cart  
**Authentication**: Required (JWT token)  
**Request Body**:
```json
{
  "itemId": "string"
}
```

### DELETE `/api/cart/[itemId]`
**Purpose**: Remove item from cart  
**Authentication**: Required (JWT token)

### DELETE `/api/cart`
**Purpose**: Clear entire cart  
**Authentication**: Required (JWT token)

---

## Order APIs

### GET `/api/orders`
**Purpose**: Get user's orders  
**Authentication**: Required (JWT token)  
**Query Parameters**:
- `type` (string): "buyer" or "seller"
- `status` (string): Order status filter

**Response**:
```json
{
  "success": true,
  "orders": [
    {
      "orderId": "string",
      "buyerId": "string",
      "sellerId": "string",
      "itemId": "string",
      "status": "string",
      "totalAmount": "number",
      "createdAt": "ISO_date",
      "item": { /* item details */ },
      "buyer": { /* buyer details */ },
      "seller": { /* seller details */ }
    }
  ]
}
```

### POST `/api/orders`
**Purpose**: Create new order  
**Authentication**: Required (JWT token)  
**Request Body**:
```json
{
  "itemId": "string",
  "quantity": "number"
}
```

### GET `/api/orders/[orderId]`
**Purpose**: Get specific order details  
**Authentication**: Required (JWT token)

### PUT `/api/orders/[orderId]/status`
**Purpose**: Update order status  
**Authentication**: Required (JWT token)  
**Request Body**:
```json
{
  "status": "pending|confirmed|completed|cancelled"
}
```

---

## Messaging APIs

### POST `/api/messages`
**Purpose**: Send a new message  
**Authentication**: Required (JWT token)  
**Request Body**:
```json
{
  "receiverId": "string",
  "itemId": "string", // optional
  "subject": "string",
  "messageContent": "string",
  "messageType": "inquiry|negotiation|arrangement|general"
}
```

### GET `/api/messages`
**Purpose**: Get user's messages  
**Authentication**: Required (JWT token)  
**Query Parameters**:
- `type` (string): "received", "sent", or "all"
- `limit` (number): Max messages to return
- `itemId` (string): Filter by item

**Response**:
```json
{
  "success": true,
  "messages": [
    {
      "messageId": "string",
      "senderId": "string",
      "receiverId": "string",
      "itemId": "string",
      "subject": "string",
      "messageContent": "string",
      "messageType": "string",
      "sentAt": "ISO_date",
      "readAt": "ISO_date"
    }
  ]
}
```

### GET `/api/conversations`
**Purpose**: Get user's conversations (grouped by participant)  
**Authentication**: Required (JWT token)  
**Query Parameters**:
- `limit` (number): Max conversations to return

**Response**:
```json
{
  "success": true,
  "conversations": [
    {
      "participantId": "string",
      "participant": {
        "uid": "string",
        "email": "string",
        "displayName": "string"
      },
      "lastMessage": { /* message object */ },
      "unreadCount": "number",
      "messageCount": "number"
    }
  ]
}
```

### GET `/api/conversations/[userId]`
**Purpose**: Get conversation with specific user  
**Authentication**: Required (JWT token)  
**Query Parameters**:
- `limit` (number): Max messages to return
- `markAsRead` (boolean): Auto-mark messages as read

### PUT `/api/messages/[messageId]`
**Purpose**: Mark message as read  
**Authentication**: Required (JWT token)

### DELETE `/api/messages/[messageId]`
**Purpose**: Delete message (sender only)  
**Authentication**: Required (JWT token)

---

## Photo APIs

### POST `/api/photos/upload`
**Purpose**: Upload photos for items  
**Authentication**: Required (JWT token)  
**Request**: Multipart form data with images  
**Response**:
```json
{
  "success": true,
  "uploadedFiles": [
    {
      "originalName": "string",
      "url": "string",
      "path": "string"
    }
  ]
}
```

### DELETE `/api/photos/[photoId]`
**Purpose**: Delete uploaded photo  
**Authentication**: Required (JWT token)

---

## Search APIs

### GET `/api/search`
**Purpose**: Search items with advanced filtering  
**Authentication**: None required  
**Query Parameters**:
- `q` (string): Search query
- `category` (string): Category filter
- `condition` (string): Condition filter
- `minPrice` (number): Price range filter
- `maxPrice` (number): Price range filter
- `location` (string): Location filter
- `sortBy` (string): Sort criteria
- `sortOrder` (string): Sort direction

**Response**:
```json
{
  "success": true,
  "results": [
    // ... item objects
  ],
  "total": "number",
  "query": "string",
  "filters": { /* applied filters */ }
}
```

---

## Category APIs

### GET `/api/categories`
**Purpose**: Get all available categories  
**Authentication**: None required  
**Response**:
```json
{
  "success": true,
  "categories": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "itemCount": "number"
    }
  ]
}
```

---

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "code": "ERROR_CODE" // Optional
}
```

### Common HTTP Status Codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resources)
- **500**: Internal Server Error

---

## Authentication

Most APIs require authentication using JWT tokens:

1. **Header**: `Authorization: Bearer <jwt_token>`
2. **Token obtained from**: `/api/auth/login` or `/api/register`
3. **Token refresh**: Use `/api/refresh-token` endpoint
4. **Admin permissions**: Required for admin APIs, checked via `isAdmin` field

---

## Rate Limiting

- **General APIs**: 100 requests per minute per user
- **Upload APIs**: 10 requests per minute per user
- **Admin APIs**: 200 requests per minute per admin

---

## Data Validation

All APIs include comprehensive input validation:
- **Email formats**: RFC 5322 compliant
- **Passwords**: Minimum 6 characters
- **Prices**: Non-negative numbers
- **Required fields**: Validated on all requests
- **File uploads**: Type and size restrictions

---

## Database Collections

The API interacts with these Firestore collections:
- `users` - User account information
- `userProfiles` - Extended user profile data
- `items` - Marketplace item listings
- `orders` - Purchase orders
- `carts` - Shopping cart data
- `messages` - User messaging
- `categories` - Item categories
- `passwordResets` - Password reset tracking

---

*Last updated: September 14, 2025*
