# Firebase Security Rules Guide

This document explains the Firebase security rules implementation for the Campus Marketplace project.

## Overview

Firebase security rules protect your Firestore database and Cloud Storage from unauthorized access. Our rules ensure that:

- Users can only access their own data
- Authentication is required for all operations
- Data integrity is maintained
- Malicious access is prevented

## Files Structure

```
├── firestore.rules          # Firestore database security rules
├── storage.rules            # Cloud Storage security rules
├── firestore.indexes.json   # Database query indexes
├── firebase.json            # Firebase project configuration
└── scripts/
    └── test-firebase-rules.sh # Local testing script
```

## Firestore Rules Explained

### User Access Control
```javascript
// Users can only access their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### Item Management
```javascript
// Users can read all items, but only edit their own
match /items/{itemId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && request.auth.uid == resource.data.sellerId;
  allow update, delete: if request.auth != null && request.auth.uid == resource.data.sellerId;
}
```

### Cart Protection
```javascript
// Users can only access their own cart
match /carts/{cartId} {
  allow read, write: if request.auth != null && request.auth.uid == cartId;
}
```

## Storage Rules Explained

### Image Upload Security
```javascript
// Only authenticated users can upload valid images
match /items/{itemId}/{fileName} {
  allow write: if request.auth != null 
    && isValidImage()
    && isOwnerOfItem(itemId);
}
```

### File Size Limits
- Maximum file size: 5MB
- Allowed formats: Images only (image/*)

## Testing Rules

### Local Testing
```bash
# Run the testing script
./scripts/test-firebase-rules.sh

# Or manually start emulators
firebase emulators:start --only firestore,storage
```

### Automated Testing (GitHub Actions)
- Rules are automatically tested on every push/PR
- Syntax validation runs first
- Emulator testing ensures rules work correctly
- Deployment happens only after successful tests

## Deployment

### Manual Deployment
```bash
# Deploy only rules
npm run firebase:deploy-rules

# Deploy everything
npm run firebase:deploy
```

### Automatic Deployment
- Rules are automatically deployed when pushed to `development` or `main` branches
- GitHub Actions workflow handles the deployment
- Failed tests prevent deployment

## Configuration

### Required Secrets (GitHub)
Set these in your GitHub repository settings:

```
FIREBASE_PROJECT_ID=campus-market-place-3f978
FIREBASE_TOKEN=your_firebase_token
FIREBASE_SERVICE_ACCOUNT_CAMPUS_MARKETPLACE_C7D92=your_service_account_json
```

### Getting Firebase Token
```bash
firebase login:ci
```

## Database Indexes

Indexes are configured in `firestore.indexes.json` for efficient queries:

- Items by category and date
- Items by seller and date  
- Messages by receiver and date

## Security Best Practices

1. **Authentication Required**: All operations require user authentication
2. **Data Ownership**: Users can only modify their own data
3. **Read Restrictions**: Public data is read-only, private data is owner-only
4. File Validation: Storage uploads are validated for type and size
5. Index Optimization: Database queries are optimized with proper indexes

## Monitoring

### Firebase Console
Monitor rule performance in the [Firebase Console](https://console.firebase.google.com/):
- Go to Firestore → Rules tab
- Check rule evaluation metrics
- Monitor denied requests

### Common Issues
1. **Rules too restrictive**: Check authentication status
2. **Performance issues**: Verify indexes are properly configured  
3. Denied requests: Check user permissions and data ownership

## Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Rules Playground](https://firebase.google.com/docs/rules/simulator)

## Team Workflow

1. Development: Test rules locally with emulators
2. Pull Request: GitHub Actions automatically test rules
3. Code Review: Team reviews rule changes
4. Merge: Rules are automatically deployed to production
5. Monitor: Check Firebase Console for any issues
