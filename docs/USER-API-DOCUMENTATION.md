# User Management API Documentation

## Overview
These APIs handle user creation, updates, and management in the Campus Marketplace database.

## Authentication
All endpoints require Firebase Authentication. Include the Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### 1. Create New User
**POST** `/api/users/create`

Creates a new user with profile and cart in the database.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "phoneNumber": "+27123456789",
  "campusLocation": "Main Campus",
  "studentNumber": "CS2023001",
  "yearOfStudy": 2,
  "bio": "Computer Science student",
  "preferredContactMethod": "email"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "userId": "firebase-uid-here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@university.edu",
    "createdAt": "2025-08-28T10:30:00Z"
  }
}
```

**Database Operations:**
- Creates document in `users` collection
- Creates document in `userProfiles` collection  
- Creates document in `carts` collection

---

### 2. Get User Profile
**GET** `/api/users/profile`

Returns complete user profile information.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "userId": "firebase-uid-here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@university.edu",
    "phoneNumber": "+27123456789",
    "isActive": true,
    "emailVerified": true,
    "profilePictureUrl": null,
    "bio": "Computer Science student",
    "preferredContactMethod": "email",
    "campusLocation": "Main Campus",
    "studentNumber": "CS2023001",
    "yearOfStudy": 2,
    "createdAt": "2025-08-28T10:30:00Z",
    "updatedAt": "2025-08-28T10:30:00Z"
  }
}
```

**Database Operations:**
- Reads from `users` collection
- Reads from `userProfiles` collection
- Combines data into single response

---

### 3. Update User Profile
**PUT** `/api/users/update`

Updates user information (partial updates supported).

**Request Body (all fields optional):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+27987654321",
  "campusLocation": "North Campus",
  "studentNumber": "CS2023002",
  "yearOfStudy": 3,
  "bio": "Updated bio text",
  "preferredContactMethod": "phone",
  "profilePictureUrl": "https://example.com/photo.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "updatedFields": {
    "user": ["firstName", "lastName", "phoneNumber"],
    "profile": ["campusLocation", "yearOfStudy", "bio"]
  }
}
```

**Database Operations:**
- Updates relevant fields in `users` collection
- Updates relevant fields in `userProfiles` collection

---

### 4. Check if User Exists
**GET** `/api/users/create`

Checks if authenticated user exists in database.

**Response (200) - User exists:**
```json
{
  "exists": true,
  "user": {
    "userId": "firebase-uid-here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@university.edu",
    "isActive": true,
    "emailVerified": true,
    "createdAt": "2025-08-28T10:30:00Z",
    "updatedAt": "2025-08-28T10:30:00Z"
  }
}
```

**Response (404) - User not found:**
```json
{
  "exists": false,
  "message": "User not found in database"
}
```

---

### 5. Deactivate User Account
**PUT** `/api/users/deactivate`

Deactivates user account (sets isActive to false).

**Response (200):**
```json
{
  "success": true,
  "message": "User account deactivated successfully",
  "userId": "firebase-uid-here"
}
```

---

### 6. Reactivate User Account
**POST** `/api/users/deactivate`

Reactivates a deactivated user account.

**Response (200):**
```json
{
  "success": true,
  "message": "User account reactivated successfully",
  "userId": "firebase-uid-here"
}
```

## Database Schema

### Users Collection (`users/{userId}`)
```json
{
  "userId": "string",
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "phoneNumber": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "isActive": "boolean",
  "emailVerified": "boolean"
}
```

### User Profiles Collection (`userProfiles/{userId}`)
```json
{
  "userId": "string",
  "profilePictureUrl": "string|null",
  "bio": "string",
  "preferredContactMethod": "email|phone|whatsapp",
  "campusLocation": "string",
  "studentNumber": "string",
  "yearOfStudy": "number",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Carts Collection (`carts/{userId}`)
```json
{
  "cartId": "string",
  "buyerId": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "message": "User already exists",
  "userId": "firebase-uid-here"
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to create user",
  "error": "Detailed error message"
}
```

## Usage Examples

### Frontend Integration

```typescript
// Create user after Firebase registration
const createUser = async (userData: CreateUserRequest) => {
  const idToken = await user.getIdToken()
  
  const response = await fetch('/api/users/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify(userData)
  })
  
  return response.json()
}

// Get user profile
const getUserProfile = async () => {
  const idToken = await user.getIdToken()
  
  const response = await fetch('/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  })
  
  return response.json()
}

// Update user profile
const updateUser = async (updates: UpdateUserRequest) => {
  const idToken = await user.getIdToken()
  
  const response = await fetch('/api/users/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify(updates)
  })
  
  return response.json()
}
```
