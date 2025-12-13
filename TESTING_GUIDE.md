# 🧪 Testing Guide - BharatShop Authentication System

## Quick Test Scenario

### ✅ Step 1: Admin Login
1. Open `http://localhost:8081/`
2. Click **"Admin Login"** tab
3. Enter credentials:
   - Username: `admin`
   - Password: `@Alakh123`
4. Click "Admin Login"
5. **Expected**: Redirected to Admin Dashboard (`/admin`)

---

### ✅ Step 2: Register First Franchise
1. On Admin Dashboard, click **"Add New Franchise"**
2. Fill in the form:
   - **Franchise Name**: `Mumbai Fresh Mart`
   - **Shop Number**: `Shop #101, MG Road, Mumbai`
   - **Email**: `mumbai@freshmart.com`
   - **Password**: `Fresh@123`
3. Click **"Register Franchise"**
4. **Expected**: 
   - Success toast appears
   - Franchise appears in table
   - Table shows all franchise details

---

### ✅ Step 3: Register Second Franchise
1. Click **"Add New Franchise"** again
2. Fill in:
   - **Franchise Name**: `Delhi Grocery Store`
   - **Shop Number**: `Shop #205, Connaught Place, Delhi`
   - **Email**: `delhi@grocery.com`
   - **Password**: `Delhi@456`
3. Click **"Register Franchise"**
4. **Expected**: 
   - Success toast appears
   - Both franchises visible in table
   - Total count shows "2"

---

### ✅ Step 4: Edit Franchise
1. Find "Mumbai Fresh Mart" in the table
2. Click **"Edit"** button
3. Change:
   - Shop Number to: `Shop #101-102, MG Road, Mumbai`
4. Click **"Save"**
5. **Expected**: 
   - Success toast appears
   - Updated shop number displayed

---

### ✅ Step 5: Admin Logout
1. Click **"Logout"** button in header
2. **Expected**: 
   - Logged out successfully
   - Redirected to login page

---

### ✅ Step 6: Franchise Login (Mumbai)
1. On login page, click **"Franchise Login"** tab
2. Enter:
   - Email: `mumbai@freshmart.com`
   - Password: `Fresh@123`
3. Click "Login to Dashboard"
4. **Expected**: 
   - Success toast appears
   - Redirected to Franchise Dashboard
   - Header shows "Mumbai Fresh Mart"

---

### ✅ Step 7: View Franchise Dashboard
1. You should see 5 tabs:
   - Billing
   - Dashboard
   - Inventory
   - Bills
   - Profile
2. Click through each tab
3. **Expected**: All tabs load correctly

---

### ✅ Step 8: Edit Franchise Profile
1. Click **"Profile"** tab
2. Click **"Edit Profile"** button
3. Change:
   - Franchise Name to: `Mumbai Premium Fresh Mart`
   - Shop Number to: `Shop #101-103, MG Road, Mumbai`
4. Click **"Save Changes"**
5. **Expected**: 
   - Success toast appears
   - Header updates with new franchise name
   - Changes saved

---

### ✅ Step 9: Franchise Logout
1. Click **"Logout"** button
2. **Expected**: 
   - Logged out successfully
   - Redirected to login page

---

### ✅ Step 10: Login as Second Franchise (Delhi)
1. Click **"Franchise Login"** tab
2. Enter:
   - Email: `delhi@grocery.com`
   - Password: `Delhi@456`
3. Click "Login to Dashboard"
4. **Expected**: 
   - Success toast appears
   - Header shows "Delhi Grocery Store"
   - Different franchise data (data isolation works)

---

### ✅ Step 11: Language Toggle Test
1. While logged in as Delhi franchise
2. Click language toggle in header
3. Switch to **Hindi**
4. **Expected**: 
   - UI text changes to Hindi
   - Currency remains ₹
5. Switch back to **English**
6. **Expected**: UI reverts to English

---

### ✅ Step 12: Admin Login Again
1. Logout from Delhi franchise
2. Login as admin (`admin` / `@Alakh123`)
3. **Expected**: 
   - Admin dashboard shows both franchises
   - Table displays:
     - Mumbai Premium Fresh Mart
     - Delhi Grocery Store

---

### ✅ Step 13: Delete Franchise (Optional)
1. On Admin Dashboard
2. Find "Delhi Grocery Store"
3. Click **"Delete"** button
4. Confirm deletion
5. **Expected**: 
   - Success toast appears
   - Franchise removed from table
   - Total count decreases to "1"

---

## 🎯 Test Cases Summary

| Test | Description | Status |
|------|-------------|--------|
| 1 | Admin login works | ✅ |
| 2 | Admin can register franchises | ✅ |
| 3 | Multiple franchises can be registered | ✅ |
| 4 | Admin can edit franchise details | ✅ |
| 5 | Admin can delete franchises | ✅ |
| 6 | Franchise login with email works | ✅ |
| 7 | Franchise sees only their data | ✅ |
| 8 | Franchise can edit their profile | ✅ |
| 9 | Franchise profile updates reflected | ✅ |
| 10 | Data isolation between franchises | ✅ |
| 11 | Language toggle works | ✅ |
| 12 | Logout functionality works | ✅ |
| 13 | Role-based access control works | ✅ |

---

## 🐛 Common Issues & Solutions

### Issue: "Email already exists"
**Solution**: Each franchise must have a unique email address

### Issue: "Invalid credentials"
**Solution**: 
- Admin: Use `admin` / `@Alakh123`
- Franchise: Use email registered by admin, not username

### Issue: Can't access admin dashboard as franchise
**Solution**: This is correct behavior - franchises only access `/dashboard`

### Issue: Changes not saving
**Solution**: 
1. Click "Save" or "Save Changes" button
2. Wait for success toast
3. Refresh page if needed

### Issue: Franchise doesn't appear after registration
**Solution**: Check if registration was successful (green toast appears)

---

## 📊 Expected Behavior

### Admin Can:
✅ View all franchises  
✅ Add new franchises  
✅ Edit any franchise  
✅ Delete any franchise  
✅ See aggregate statistics  
✅ Logout  

### Admin Cannot:
❌ Access franchise dashboard  
❌ Delete their own account  

### Franchise Can:
✅ Login with their email  
✅ View their own data only  
✅ Edit their own profile  
✅ Delete their own account  
✅ Access all 5 dashboard tabs  
✅ Logout  

### Franchise Cannot:
❌ See other franchises' data  
❌ Access admin dashboard  
❌ Register new franchises  
❌ Edit other franchises  

---

## 🚀 Next Steps After Testing

1. ✅ All tests passed? → System is working correctly
2. ❌ Some tests failed? → Check console for errors
3. 💡 Need more features? → Review AUTHENTICATION_SYSTEM.md

---

**Happy Testing!** 🎉
