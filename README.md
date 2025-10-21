# Campus Marketplace - NWU Student Marketplace

![Campus Marketplace Logo](https://github.com/Pieter246/campus-marketplace/blob/development/public/logo.svg?raw=true)

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Running the Application](#running-the-application)
5. [Environment Setup](#environment-setup)
6. [Firebase Configuration](#firebase-configuration)
7. [PayFast Integration](#payfast-integration)
8. [Core Features](#core-features)
9. [Admin Dashboard](#admin-dashboard)
10. [Troubleshooting](#troubleshooting)
11. [Contributors](#contributors)

## Introduction

Campus Marketplace is a secure web application designed for North-West University (NWU) students to buy and sell second-hand items such as textbooks, electronics, and other goods.  
This platform aims to provide a safe, user-friendly, and efficient way for students to trade within the campus community.

Key functionalities include:
- **User Authentication**: Secure login and registration via Firebase.
- **Item Listings**: Users can create, update, and delete item listings.
- **Item Filtering and Search**: Easily search and filter items by category, condition, and price.
- **Secure Payments**: Integrated with PayFast to ensure safe and verified transactions.
- **Admin Dashboard**: Admins can manage users and listings, and oversee the platform.

This README will guide you through the setup and configuration of the Campus Marketplace web application.

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/en/download/) (version 18.x or higher)
- [npm](https://www.npmjs.com/get-npm) (usually comes with Node.js)
- [Git](https://git-scm.com/downloads)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- [PayFast Developer Account](https://www.payfast.co.za/)

To check your installed versions:
- For Node.js: `node -v`
- For npm: `npm -v`
- For Firebase: `firebase --version`

---

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/Pieter246/campus-marketplace
   cd campus-marketplace
   ```
2. Install npm dependencies:
   ```
   npm install
   ```
3. Copy the environment file:
    ```
    cp .env.example .env.local
    ```
4. Add your Firebase and PayFast credentials to the `.env.local` file (see details below).

5. Build the frontend:
   
---

## Running the Application

1. To start the development server, run:
   ```
   npm run dev
   ```
The application will be available at `http://localhost:3000`.

2. To run the production build:
   ```
   npm run build
   npm start
   ```
This will start the optimized production server.

---

## Environment Setup

In your `.env.local` file, include the following keys:
```
# Backend
FIREBASE_PROJECT_ID=enter_yours_here
FIREBASE_PRIVATE_KEY_ID=enter_yours_here
FIREBASE_PRIVATE_KEY=enter_yours_here
FIREBASE_CLIENT_EMAIL=enter_yours_here
FIREBASE_CLIENT_ID=enter_yours_here
FIREBASE_CLIENT_CERT_URL=enter_yours_here
ADMIN_EMAILS=enter_yours_here

# App (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=enter_yours_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=enter_yours_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=enter_yours_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=enter_yours_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=enter_yours_here
NEXT_PUBLIC_FIREBASE_APP_ID=enter_yours_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=enter_yours_here

NEXT_PUBLIC_FIREBASE_STORAGE_ACCESS: enter_yours_here

# Payfast
PAYFAST_MERCHANT_ID=enter_yours_here
PAYFAST_MERCHANT_KEY=enter_yours_here
PAYFAST_PASSPHRASE=enter_yours_here
NEXT_PUBLIC_BASE_URL=enter_yours_here
```
## Firebase Configuration

Campus Marketplace uses Firebase for:
- **Authentication** (Email and Google Sign-In)
- **Firestore Database** for user, item, and transaction storage
- **Firebase Storage** for uploading and hosting item images

To configure Firebase:
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project.
3. Enable Authentication, Firestore, and Storage.
4. Copy your project credentials into the `.env.local` file.

---

## PayFast Integration

Campus Marketplace integrates with **PayFast** to securely handle payments between buyers and sellers.

1. Create a [PayFast Sandbox Account](https://sandbox.payfast.co.za/).
2. Retrieve your **Merchant ID** and **Merchant Key**.
3. Add these values to your `.env.local` file.
4. Test your integration using the sandbox environment.

---

## Core Features

Campus Marketplace offers the following main features:

- **Sign Up and Login**  
  Users can register via email or Google Sign-In.  
  Firebase Authentication ensures all logins are secure.

- **Profile Management**  
  Users can update their details, manage listed items, and view purchase history.

- **Item Listings**  
  Users can create new listings, upload images, and set item conditions, prices, and categories.  
  Each listing is reviewed by an administrator before being made public.

- **Item Search and Filter**  
  Users can filter items by category, condition, or price range.

- **Buying Items**  
  Users can purchase items securely via PayFast. Funds are held until the item collection is confirmed.

- **Selling Items**  
  Sellers receive payment only after the buyer marks the item as collected.  
  Both parties retain a selfie photo for verification in case of disputes.

---

## Admin Dashboard

Administrators have full access to the **Admin Dashboard**, where they can:

- View and manage all users on the platform.
- Approve, reject, or modify listings for accuracy and quality.
- Suspend or remove users who violate platform policies.
- Access metrics on:
  - Total users and items
  - Items sold per user
  - Price distribution of listings
  - Listing statuses (active, sold, pending)

---

## Troubleshooting

If you encounter issues:

1. Check if all dependencies are installed:
   ```
   npm install
   ```
2. Verify Firebase configuration:
  ```
  firebase login
  firebase projects:list
  ```
3. Rebuild and restart the application:
  ```
  npm run build
  npm start
  ```

4. Ensure your PayFast sandbox account is active and correctly configured.

---

## Contributors

Our group details:

**Group Name:** Campus Marketplace Development Team  


**Group Member 1 (Group Leader)**  
Name and surname: Daniël de Jager 
Student number: 41669436  
University Email Address: 41669436@mynwu.ac.za  


**Group Member 2 (Group Leader)**  
Name and surname: Pieter Meyer 
Student number: 42937582  
University Email Address: 42937582@mynwu.ac.za 


**Group Member 3**  
Name and surname: Petrus Daniel Bekker  
Student number: 37267027  
University Email Address: 37267027@mynwu.ac.za 


**Group Member 4**  
Name and surname: Johann Nell  
Student number: 38609029  
University Email Address: 38609029@mynwu.ac.za 


**Group Member 5**  
Name and surname: Thabiso Nkashe
Student number: 38614898  
University Email Address: 38614898@mynwu.ac.za 


**Group Member 6**  
Name and surname: Dimpho Malatji  
Student number: 42705576  
University Email Address: 42705576@mynwu.ac.za 


**Group Member 7**  
Name and surname: Bradley Motsiri 
Student number: 29998360  
University Email Address: 37267027@mynwu.ac.za 


**Group Member 8**  
Name and surname: Delius Schoeman 
Student number: 45616779  
University Email Address: 45616779@mynwu.ac.za 


**Group Member 9**  
Name and surname: Tiyane Sibuya
Student number: 42591570  
University Email Address: 42591570@mynwu.ac.za 


**Group Member 10**  
Name and surname: Reese Van Der Linde
Student number: 46859675  
University Email Address: 46859675@mynwu.ac.za 


**Group Member 11**  
Name and surname: Meiring van Niekerk
Student number: 47817909  
University Email Address: 47817909@mynwu.ac.za 


**Group Member 12**  
Name and surname: Daniel Van Wyk
Student number: 33505136  
University Email Address: 33505136@mynwu.ac.za 


**Group Member 13**  
Name and surname: Sithole Zakhele
Student number: 36081868  
University Email Address: 36081868@mynwu.ac.za 

---

For any additional assistance, please contact the Campus Marketplace development team or open an issue in the GitHub repository.

