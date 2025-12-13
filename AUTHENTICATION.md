# 🔐 BharatShop Authentication System

## Overview
Complete franchise management system with admin and franchise roles. Admin registers franchises, franchises manage their own data.

---

## 🎯 System Flow

### 1. Admin Workflow
1. **Login**: Admin logs in with username and password
   - URL: `http://localhost:8081/`
   - Credentials: `admin` / `@Alakh123`

2. **Access Admin Dashboard**: After login, redirected to `/admin`

3. **Register New Franchise**: Click "Add New Franchise"
   - Franchise / Store Name (e.g., "Mumbai Fresh Mart")
   - Shop Number (e.g., "Shop #123, MG Road")
   - Email Address (e.g., "franchise@example.com")
   - Password (secure password for franchise)

4. **Manage Franchises**:
   - **View**: See all registered franchises in a table
   - **Edit**: Click "Edit" to modify franchise details
   - **Delete**: Remove franchises permanently

---

### 2. Franchise Workflow
1. **Admin Registers Franchise**: Admin creates franchise account with:
   - Franchise Name
   - Shop Number
   - Email
   - Password

2. **Franchise Login**: Franchise logs in using their email and password
   - URL: `http://localhost:8081/`
   - Click "Franchise Login" tab
   - Enter registered email and password

3. **Access Franchise Dashboard**: After login, redirected to `/dashboard`

4. **Manage Own Data**:
   - **View Dashboard**: See sales, inventory, bills (franchise-specific data)
   - **Edit Profile**: Click "Profile" tab to update:
     - Franchise Name
     - Shop Number
     - Email
     - Password
   - **Delete Account**: Permanently delete franchise account (danger zone)

---

## 📋 Key Features

### Admin Features
✅ Login with admin credentials  
✅ View all franchises  
✅ Register new franchises with complete details  
✅ Edit franchise information  
✅ Delete franchises  
✅ View total sales across all franchises  
✅ Logout functionality  

### Franchise Features
✅ Login with email and password  
✅ View only their own data (isolated)  
✅ Access AI billing scanner  
✅ Manage inventory  
✅ View bills and analytics  
✅ Edit their profile details  
✅ Delete their own account  
✅ Logout functionality  

---

## 🔑 Login Credentials

### Admin
- **Username**: `admin`
- **Password**: `@Alakh123`
- **Access**: Admin Dashboard (`/admin`)

### Franchise
- **Email**: Registered by admin
- **Password**: Set by admin during registration
- **Access**: Franchise Dashboard (`/dashboard`)

---

## 📊 Data Structure

### Franchise Data Model
```typescript
{
  id: string;                  // Unique identifier
  franchiseName: string;       // Store name
  shopNumber: string;          // Physical location
  email: string;              // Login email (unique)
  password: string;           // Login password
  createdAt: string;          // Registration date
  sales?: number;             // Total sales
  inventory?: any[];          // Products inventory
  bills?: any[];              // Transaction history
}
```

---

## 🎨 UI/UX Features

### Indian Theme
- 🇮🇳 Tricolor design (Saffron, White, Green)
- Indian fonts (Poppins, Noto Sans Devanagari)
- Currency in Indian Rupee (₹)
- Bilingual support (English/Hindi)

### Animations
- Smooth transitions with Framer Motion
- Glassmorphism effects
- Gradient backgrounds
- Shadow glow effects

---

## 🔒 Security Features

1. **Role-Based Access Control**
   - Admin can only access `/admin`
   - Franchises can only access `/dashboard`
   - Automatic redirect to correct dashboard

2. **Data Isolation**
   - Franchises see only their own data
   - Admin sees all franchises

3. **Protected Routes**
   - Unauthenticated users redirected to login
   - Role validation on every route

---

## 🚀 How to Use

### Starting the Application
```bash
npm run dev
```
Visit: `http://localhost:8081/`

### Admin Workflow
1. Click "Admin Login" tab
2. Enter: `admin` / `@Alakh123`
3. Click "Add New Franchise"
4. Fill in franchise details
5. Franchise is now registered and can login

### Franchise Workflow
1. Wait for admin to register your franchise
2. Receive email and password from admin
3. Click "Franchise Login" tab
4. Enter your email and password
5. Access your dashboard
6. Go to "Profile" tab to edit your information

---

## 📱 Tabs in Franchise Dashboard

1. **Billing** 🧾 - AI-powered billing scanner
2. **Dashboard** 📊 - Sales analytics and charts
3. **Inventory** 📦 - Product management
4. **Bills** 💰 - Transaction history
5. **Profile** 👤 - Edit franchise details

---

## 🎯 Data Persistence

All data is stored in **localStorage**:
- `franchises`: Array of all franchise data
- `currentUser`: Currently logged-in user

---

## 💡 Important Notes

1. **Email is the username** for franchises (unique identifier)
2. **Admin must be logged in** to add franchises
3. **Franchises cannot self-register** - only admin can add them
4. **Data is isolated** - franchises see only their own data
5. **Profile editing** - franchises can update their own information
6. **Account deletion** - franchises can delete their own account
7. **Language support** - Switch between English and Hindi anytime

---

## 🌟 Future Enhancements

- Email verification for franchises
- Forgot password functionality
- Multi-level admin roles
- Real-time data sync
- Backend API integration
- SMS notifications
- Advanced analytics
- Bulk franchise import

---

## 📞 Support

For any issues or questions, contact the admin.

---

**Made with ❤️ in India** 🇮🇳
