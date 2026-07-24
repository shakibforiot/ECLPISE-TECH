# WebApp Logo & AR - E-commerce Dashboard

A modern, responsive e-commerce web application with user and admin panels for selling logos, AR filters, and digital products. Built with React, Vite, Tailwind CSS, and Firebase.

## Features

### User Features
- **Authentication**: Login and registration with Firebase Auth
- **User Dashboard**: Personalized dashboard with stats and quick actions
- **Shop**: Browse products with filtering, sorting, and search
- **Product Details**: Detailed view of each product with images, description, and reviews
- **Shopping Cart**: Add/remove items, update quantities
- **Profile Management**: Edit profile information and preferences
- **Responsive Design**: Works on mobile, tablet, and desktop

### Admin Features
- **Admin Dashboard**: Overview of sales, orders, users, and products
- **Product Management**: Add, edit, delete products
- **User Management**: View, edit, and manage all users
- **Role Management**: Assign admin or user roles
- **Real-time Updates**: Firebase Realtime Database for instant updates

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Authentication**: Firebase Authentication
- **Database**: Firebase Realtime Database
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shakibforiot/ECLPISE-TECH.git
cd webapp-logo-ar
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password authentication
   - Create a Realtime Database
   - Copy your Firebase config

4. Update Firebase configuration:
   Edit `src/lib/firebase.ts` with your Firebase config:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. Run the development server:
```bash
npm run dev
```

6. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   └── Layout.tsx          # Main layout with sidebar
├── context/
│   └── AuthContext.tsx     # Authentication context
├── lib/
│   └── firebase.ts         # Firebase configuration
├── pages/
│   ├── auth/
│   │   ├── Login.tsx       # Login page
│   │   └── Register.tsx    # Registration page
│   ├── user/
│   │   ├── Dashboard.tsx   # User dashboard
│   │   └── Profile.tsx     # User profile
│   ├── admin/
│   │   ├── Dashboard.tsx   # Admin dashboard
│   │   ├── Products.tsx     # Product management
│   │   ├── Users.tsx       # User management
│   │   └── AddProduct.tsx  # Add new product
│   ├── Shop.tsx            # Product listing
│   ├── Cart.tsx            # Shopping cart
│   └── ProductDetail.tsx   # Product detail page
├── types/
│   └── index.ts            # TypeScript types
├── App.tsx                 # Main app with routing
└── main.tsx                # Entry point
```

## Routes

### Public Routes
- `/login` - Login page
- `/register` - Registration page

### User Routes (Protected)
- `/` - User dashboard
- `/shop` - Product listing
- `/cart` - Shopping cart
- `/product/:id` - Product detail
- `/profile` - User profile

### Admin Routes (Protected + Admin Role)
- `/admin/dashboard` - Admin dashboard
- `/admin/products` - Product management
- `/admin/products/add` - Add new product
- `/admin/users` - User management

## Customization

### Colors
The application uses a modern color scheme with:
- Primary: Violet (#8b5cf6) to Indigo (#6366f1)
- Success: Emerald (#10b981)
- Warning: Amber (#f59e0b)
- Danger: Red (#ef4444)

### Adding Products
To add products programmatically, use the Firebase Realtime Database:
```javascript
import { ref, set } from 'firebase/database';
import { database } from './lib/firebase';

const newProductRef = push(ref(database, 'products'));
await set(newProductRef, {
  name: 'Product Name',
  description: 'Product description',
  price: 99.99,
  category: 'Logo Design',
  imageUrl: 'https://example.com/image.jpg',
  colors: ['Red', 'Blue'],
  stock: 10,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
```

### User Roles
Users can have two roles:
- `user` - Regular user with access to shop and profile
- `admin` - Admin with access to admin dashboard and management features

To make a user admin:
```javascript
import { ref, set } from 'firebase/database';
import { database } from './lib/firebase';

await set(ref(database, `users/${userId}/role`), 'admin');
```

## Features to Add

- [ ] Payment integration (Stripe, PayPal)
- [ ] Order management system
- [ ] Product categories and tags
- [ ] Discounts and coupons
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Advanced analytics
- [ ] Export data functionality
- [ ] Multi-language support
- [ ] Dark mode

## License

MIT License

## Support

For support, please contact: support@webapp-logo-ar.com
