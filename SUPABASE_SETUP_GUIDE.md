# 🚀 Supabase Database Setup Guide

## ✅ What Has Been Done

1. ✅ Installed `@supabase/supabase-js` package
2. ✅ Created `.env.local` with your Supabase credentials
3. ✅ Created Supabase client (`src/lib/supabase.ts`)
4. ✅ Designed SQL schema (`supabase-schema.sql`)
5. ✅ Updated AuthContext to use Supabase
6. ✅ Updated AdminDashboard to use Supabase
7. ✅ Backed up old files (*.old.tsx)

---

## 🔴 CRITICAL: YOU MUST DO THIS NOW

### Step 1: Execute SQL Schema in Supabase

1. **Open Supabase Dashboard:**
   - Go to: https://dsqhrzrdxguxmvjkfrtg.supabase.co
   - Login with your Supabase account

2. **Open SQL Editor:**
   - Click **SQL Editor** in the left sidebar (database icon)
   - Click **New Query** button

3. **Copy the Schema:**
   - Open `supabase-schema.sql` file in VS Code
   - Copy ALL 86 lines (Ctrl+A, Ctrl+C)

4. **Execute the Schema:**
   - Paste into the SQL Editor
   - Click **RUN** button (or press Ctrl+Enter)
   - Wait for "Success. No rows returned" message

5. **Verify Tables Created:**
   - Click **Table Editor** in left sidebar
   - You should see 3 tables:
     - ✅ `franchises`
     - ✅ `inventory`
     - ✅ `bills`

---

## 🧪 Testing the Connection

### Step 2: Restart Dev Server

```powershell
# In your VS Code terminal:
npm run dev
```

### Step 3: Test Admin Login

1. Go to: http://localhost:8081/
2. Click **Admin Login** tab
3. Login with:
   - Username: `admin`
   - Password: `@Alakh123`

### Step 4: Add Your First Franchise

1. On Admin Dashboard, click **Add New Franchise** button
2. Fill in details:
   - Franchise Name: `Mumbai Fresh Mart`
   - Shop Number: `Shop #101, MG Road`
   - Email: `mumbai@test.com`
   - Password: `test123`
3. Click **Register Franchise**
4. You should see success message: ✅ Franchise registered!

### Step 5: Verify in Supabase

1. Go back to Supabase Dashboard
2. Click **Table Editor** → **franchises** table
3. You should see your newly added franchise row

### Step 6: Test Franchise Login

1. Logout from Admin
2. Click **Franchise Login** tab
3. Login with:
   - Email: `mumbai@test.com`
   - Password: `test123`
4. You should see Franchise Dashboard

---

## 🔍 Troubleshooting

### ❌ Error: "Failed to load franchises"

**Solution:** You didn't execute the SQL schema yet.
- Follow Step 1 above to create tables in Supabase

### ❌ Error: "Invalid API key"

**Solution:** Check `.env.local` file:
```env
VITE_SUPABASE_URL=https://dsqhrzrdxguxmvjkfrtg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcWhyenJkeGd1eG12amtmcnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NDA2MTksImV4cCI6MjA1MjUxNjYxOX0.sb_publishable_Xs553QhiUDeCq3MPnCF5Vw_XYd7IuVd
```

Restart dev server after changing `.env.local`.

### ❌ Tables not appearing in Supabase

**Solution:** 
1. Make sure you're logged into the correct Supabase project
2. Check the URL matches: `dsqhrzrdxguxmvjkfrtg`
3. Re-run the SQL schema in SQL Editor

### ❌ "Add New Franchise" button not visible

**Solution:**
1. Clear browser cache (Ctrl+Shift+R)
2. Make sure SQL schema was executed
3. Check browser console for errors (F12)

---

## 📊 Database Structure

### Table: `franchises`
- `id` (UUID) - Primary Key
- `franchise_name` (TEXT) - Store name
- `shop_number` (TEXT) - Shop address
- `email` (TEXT) - Unique login email
- `password` (TEXT) - Login password
- `sales` (DECIMAL) - Total sales amount
- `created_at` (TIMESTAMP) - Registration date

### Table: `inventory`
- `id` (UUID) - Primary Key
- `franchise_id` (UUID) - Foreign Key → franchises.id
- `product_name` (TEXT) - Product name
- `quantity` (INTEGER) - Stock quantity
- `price` (DECIMAL) - Product price
- `category` (TEXT) - Product category
- `created_at` (TIMESTAMP)

### Table: `bills`
- `id` (UUID) - Primary Key
- `franchise_id` (UUID) - Foreign Key → franchises.id
- `customer_name` (TEXT) - Customer name
- `total_amount` (DECIMAL) - Bill total
- `items` (JSONB) - Bill items array
- `status` (TEXT) - 'completed', 'pending', etc.
- `created_at` (TIMESTAMP)

---

## 🔐 Security Notes

⚠️ **Current RLS Policies are OPEN for development**

The current Row Level Security (RLS) policies allow public access for easy testing. For production:

1. Implement proper authentication
2. Restrict franchise data access by franchise_id
3. Add admin-only policies
4. Remove public access policies

Example secure policy:
```sql
-- Only allow franchise to see their own data
CREATE POLICY "Franchises can only see own inventory" 
ON inventory FOR SELECT 
USING (franchise_id = auth.uid());
```

---

## 📝 What Changed from localStorage

### Before (localStorage):
```typescript
const data = JSON.parse(localStorage.getItem('franchises') || '[]');
setFranchises(data);
```

### After (Supabase):
```typescript
const { data } = await supabase.from('franchises').select('*');
setFranchises(data || []);
```

### Benefits:
- ✅ Data persists across devices
- ✅ Data is backed up automatically
- ✅ Real PostgreSQL database
- ✅ Can handle thousands of records
- ✅ Built-in authentication support
- ✅ Real-time subscriptions available
- ✅ REST API auto-generated

---

## 🎯 Next Steps After Setup

Once tables are created and working:

1. **Add more franchises** from Admin Dashboard
2. **Test franchise login** with different emails
3. **Update inventory** from Franchise Dashboard
4. **Create bills** and verify they're saved
5. **Check Supabase Table Editor** to see real-time data

---

## 📞 Support

If you encounter any issues:

1. Check Supabase Dashboard → **Logs** → **Postgres Logs**
2. Check browser console (F12) for JavaScript errors
3. Verify `.env.local` credentials match Supabase project
4. Ensure SQL schema was executed successfully

---

## 🌟 Connection String (for reference)

If you need direct PostgreSQL connection:

**Direct Connection:**
```
postgresql://postgres:@Alakh123@db.dsqhrzrdxguxmvjkfrtg.supabase.co:5432/postgres
```

**Transaction Pooler:**
```
postgresql://postgres.dsqhrzrdxguxmvjkfrtg:@Alakh123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

**Session Pooler:**
```
postgresql://postgres.dsqhrzrdxguxmvjkfrtg:@Alakh123@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

---

**🚀 Ready to launch! Execute Step 1 now to create database tables.**
