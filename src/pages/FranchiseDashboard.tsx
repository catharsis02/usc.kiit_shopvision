import { StatsCard } from "@/components/StatsCard";
import { SalesBarChart, CategoryPieChart, RevenueLineChart, StockLevelChart, OrdersTrendChart } from "@/components/DashboardCharts";
import { BillsTable } from "@/components/BillsTable";
import { InventoryTable } from "@/components/InventoryTable";
import { BillingScanner } from "@/components/BillingScanner";
import { IndianBanner } from "@/components/IndianBanner";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardStats } from "@/lib/data";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Package,
  Receipt,
  LayoutDashboard,
  Scan,
  LogOut,
  Store,
  Edit,
  Save,
  X,
  Mail,
  Lock,
  Building,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function FranchiseDashboard() {
  const location = useLocation();
  const { t } = useLanguage();
  const { user, logout, getFranchiseData, updateFranchiseData, deleteFranchiseData } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    franchiseName: '',
    shopNumber: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        const data = await getFranchiseData(user.id);
        if (data) {
          setEditData({
            franchiseName: data.franchiseName,
            shopNumber: data.shopNumber,
            email: data.email,
            password: data.password
          });
        }
      }
    };
    loadData();
  }, [user, getFranchiseData]);

  const getActiveTab = () => {
    if (location.pathname.includes('/inventory')) return 'inventory';
    if (location.pathname.includes('/bills')) return 'bills';
    if (location.pathname.includes('/billing')) return 'billing';
    if (location.pathname.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  const handleSaveProfile = () => {
    if (user?.id) {
      const success = updateFranchiseData(user.id, editData);
      if (success) {
        setIsEditing(false);
        toast.success("✅ Profile updated successfully!");
      } else {
        toast.error("❌ Failed to update profile");
      }
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("⚠️ Are you sure you want to delete your franchise account? This action cannot be undone.")) {
      if (user?.id) {
        const success = deleteFranchiseData(user.id);
        if (success) {
          toast.success("✅ Account deleted successfully");
          logout();
        } else {
          toast.error("❌ Failed to delete account");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full gradient-glass border-b border-border/50">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-fresh shadow-glow">
              <span className="text-xl">🏪</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              भारत<span className="text-gradient-fresh">Shop</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{user?.franchiseName || user?.email}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-fresh text-primary-foreground shadow-glow">
              <span className="text-sm font-medium">{t('franchise.portal')}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 border-2 hover:border-destructive hover:shadow-lg hover:scale-105">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <IndianBanner />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient-tricolor">
              {t('dashboard.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-primary">
              {t('dashboard.exportReport')}
            </Button>
            <Button variant="default" size="sm" className="bg-gradient-fresh border-0 shadow-glow hover:scale-105 hover:shadow-2xl transition-all duration-300 font-semibold text-white">
              {t('dashboard.refreshData')}
            </Button>
          </div>
        </div>

        <Tabs defaultValue={getActiveTab()} className="space-y-8">
          <TabsList className="grid w-full max-w-3xl grid-cols-5 bg-gradient-card border border-border/50">
            <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-gradient-fresh data-[state=active]:text-primary-foreground">
              <Scan className="h-4 w-4" />
              {t('nav.billing')}
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-gradient-fresh data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
              {t('nav.dashboard')}
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2 data-[state=active]:bg-gradient-fresh data-[state=active]:text-primary-foreground">
              <Package className="h-4 w-4" />
              {t('nav.inventory')}
            </TabsTrigger>
            <TabsTrigger value="bills" className="gap-2 data-[state=active]:bg-gradient-fresh data-[state=active]:text-primary-foreground">
              <Receipt className="h-4 w-4" />
              {t('nav.bills')}
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-gradient-fresh data-[state=active]:text-primary-foreground">
              <Store className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="billing" className="space-y-8">
            <BillingScanner />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title={t('stats.totalRevenue')}
                value={`₹${dashboardStats.totalRevenue.toLocaleString('en-IN')}`}
                change={t('stats.totalRevenue.change')}
                changeType="positive"
                icon={DollarSign}
                iconColor="primary"
              />
              <StatsCard
                title={t('stats.todaySales')}
                value={`₹${dashboardStats.todayRevenue.toLocaleString('en-IN')}`}
                change={t('stats.todaySales.change')}
                changeType="positive"
                icon={TrendingUp}
                iconColor="secondary"
              />
              <StatsCard
                title={t('stats.totalOrders')}
                value={dashboardStats.totalOrders.toLocaleString('en-IN')}
                change={`${dashboardStats.todayOrders} ${t('stats.totalOrders.change')}`}
                changeType="neutral"
                icon={ShoppingCart}
                iconColor="accent"
              />
              <StatsCard
                title={t('stats.totalCustomers')}
                value={dashboardStats.totalCustomers.toLocaleString('en-IN')}
                change={`+${dashboardStats.newCustomers} ${t('stats.totalCustomers.change')}`}
                changeType="positive"
                icon={Users}
                iconColor="primary"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <SalesBarChart />
              <CategoryPieChart />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <RevenueLineChart />
              <OrdersTrendChart />
            </div>

            <StockLevelChart />
            <BillsTable />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title={t('stats.totalProducts')}
                value="12"
                change={`8 ${t('stats.totalProducts.change').split(', ')[0]}, 4 ${t('stats.totalProducts.change').split(', ')[1]}`}
                changeType="neutral"
                icon={Package}
                iconColor="primary"
              />
              <StatsCard
                title={t('stats.lowStock')}
                value="3"
                change={t('stats.lowStock.change')}
                changeType="negative"
                icon={Package}
                iconColor="destructive"
              />
              <StatsCard
                title={t('stats.outOfStock')}
                value="0"
                change={t('stats.outOfStock.change')}
                changeType="positive"
                icon={Package}
                iconColor="primary"
              />
              <StatsCard
                title={t('stats.stockValue')}
                value="₹4,250"
                change={t('stats.stockValue.change')}
                changeType="neutral"
                icon={DollarSign}
                iconColor="secondary"
              />
            </div>

            <StockLevelChart />
            <InventoryTable />
          </TabsContent>

          <TabsContent value="bills" className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title={t('stats.totalBills')}
                value="342"
                change={t('stats.totalBills.change')}
                changeType="neutral"
                icon={Receipt}
                iconColor="primary"
              />
              <StatsCard
                title={t('stats.completed')}
                value="325"
                change={`95.0% ${t('stats.completed.change')}`}
                changeType="positive"
                icon={Receipt}
                iconColor="primary"
              />
              <StatsCard
                title={t('stats.pending')}
                value="12"
                change={t('stats.pending.change')}
                changeType="neutral"
                icon={Receipt}
                iconColor="secondary"
              />
              <StatsCard
                title={t('stats.refunded')}
                value="5"
                change={`1.5% ${t('stats.refunded.change')}`}
                changeType="negative"
                icon={Receipt}
                iconColor="destructive"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <SalesBarChart />
              <RevenueLineChart />
            </div>

            <BillsTable />
          </TabsContent>

          <TabsContent value="profile" className="space-y-8">
            <Card className="p-8 bg-gradient-card border-2 border-primary/20 shadow-glow max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Franchise Profile</h2>
                  <p className="text-sm text-muted-foreground">Manage your franchise information</p>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-2 hover:border-primary hover:shadow-lg hover:scale-105">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="profile-franchiseName">
                    <Store className="h-4 w-4 inline mr-2" />
                    Franchise / Store Name
                  </Label>
                  <Input
                    id="profile-franchiseName"
                    value={editData.franchiseName}
                    onChange={(e) => setEditData({ ...editData, franchiseName: e.target.value })}
                    disabled={!isEditing}
                    className="border-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-shopNumber">
                    <Building className="h-4 w-4 inline mr-2" />
                    Shop Number
                  </Label>
                  <Input
                    id="profile-shopNumber"
                    value={editData.shopNumber}
                    onChange={(e) => setEditData({ ...editData, shopNumber: e.target.value })}
                    disabled={!isEditing}
                    className="border-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    disabled={!isEditing}
                    className="border-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-password">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Password
                  </Label>
                  <Input
                    id="profile-password"
                    type="password"
                    value={editData.password}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    disabled={!isEditing}
                    className="border-primary/30"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-gradient-fresh border-0 shadow-glow flex-1 gap-2 hover:scale-105 hover:shadow-2xl transition-all duration-300 font-semibold text-white"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={async () => {
                        setIsEditing(false);
                        if (user?.id) {
                          const data = await getFranchiseData(user.id);
                          if (data) {
                            setEditData({
                              franchiseName: data.franchiseName,
                              shopNumber: data.shopNumber,
                              email: data.email,
                              password: data.password
                            });
                          }
                        }
                      }}
                      variant="outline"
                      className="gap-2 hover:bg-muted hover:scale-105 transition-all duration-300 border-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button onClick={handleDeleteAccount} variant="destructive" className="gap-2 hover:bg-destructive/90 hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 font-semibold">
                  <Trash2 className="h-4 w-4" />
                  Delete My Franchise Account
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

