import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageToggle } from "@/components/LanguageToggle";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Store, 
  Trash2, 
  Plus, 
  Mail, 
  Calendar,
  Edit,
  Save,
  X,
  LogOut,
  Shield,
  TrendingUp,
  Package,
  Lock,
  Building
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface FranchiseRow {
  id: string;
  franchise_name: string;
  shop_number: string;
  email: string;
  password: string;
  created_at: string;
  sales: number;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [franchises, setFranchises] = useState<FranchiseRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FranchiseRow>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newFranchise, setNewFranchise] = useState({
    franchise_name: '',
    shop_number: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    loadFranchises();
  }, []);

  const loadFranchises = async () => {
    try {
      console.log('📥 Loading franchises from Supabase...');
      
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading franchises:', error);
        toast.error("Failed to load franchises", {
          description: error.message
        });
        setFranchises([]); // Clear franchises on error
        return;
      }

      console.log('✅ Franchises loaded:', data?.length || 0);
      setFranchises(data || []);
      
      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} franchise(s)`);
      }
    } catch (error) {
      console.error('❌ Exception loading franchises:', error);
      toast.error("Failed to load franchises");
      setFranchises([]);
    }
  };

  const handleAddFranchise = async () => {
    if (!newFranchise.franchise_name || !newFranchise.shop_number || !newFranchise.email || !newFranchise.password) {
      toast.error("❌ All fields are required");
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Attempting to insert franchise:', {
        franchise_name: newFranchise.franchise_name,
        shop_number: newFranchise.shop_number,
        email: newFranchise.email,
        password: '***hidden***',
        sales: 0
      });

      const { data, error } = await supabase
        .from('franchises')
        .insert([{
          franchise_name: newFranchise.franchise_name,
          shop_number: newFranchise.shop_number,
          email: newFranchise.email,
          password: newFranchise.password,
          sales: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('🔴 Supabase Error Details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: error
        });

        if (error.code === '23505') {
          toast.error("❌ Email already exists");
        } else if (error.code === '42501') {
          toast.error("❌ Permission denied - Check RLS policies");
        } else if (error.code === 'PGRST116') {
          toast.error("❌ Table not found or RLS blocking access");
        } else {
          toast.error(`❌ Failed: ${error.message || 'Unknown error'}`);
        }
        setLoading(false);
        return;
      }

      console.log('✅ Franchise added successfully:', data);
      toast.success(`✅ Franchise "${newFranchise.franchise_name}" registered successfully!`, {
        description: `Email: ${newFranchise.email} | Shop: ${newFranchise.shop_number}`
      });

      loadFranchises();
      setIsAddDialogOpen(false);
      setNewFranchise({ franchise_name: '', shop_number: '', email: '', password: '' });
    } catch (error) {
      console.error('🔴 Exception caught:', error);
      toast.error(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (franchise: FranchiseRow) => {
    setEditingId(franchise.id);
    setEditData({
      franchise_name: franchise.franchise_name,
      shop_number: franchise.shop_number,
      email: franchise.email,
      password: franchise.password
    });
  };

  const handleEditSave = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('franchises')
        .update({
          franchise_name: editData.franchise_name,
          shop_number: editData.shop_number,
          email: editData.email,
          password: editData.password
        })
        .eq('id', id);

      if (error) {
        toast.error("❌ Failed to update franchise");
        console.error('Error updating:', error);
        setLoading(false);
        return;
      }

      toast.success("✅ Franchise updated successfully!");
      loadFranchises();
      setEditingId(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error("❌ Failed to update franchise");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id: string, franchiseName: string) => {
    if (!confirm(`Are you sure you want to delete franchise "${franchiseName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('franchises')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error("❌ Failed to delete franchise");
        console.error('Error deleting:', error);
        setLoading(false);
        return;
      }

      toast.success(`✅ Franchise "${franchiseName}" deleted successfully!`);
      loadFranchises();
    } catch (error) {
      console.error('Error:', error);
      toast.error("❌ Failed to delete franchise");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("👋 Logged out successfully!");
  };

  const totalSales = franchises.reduce((sum, f) => sum + (f.sales || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-card/80 border-b-2 border-primary/20 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-fresh">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-tricolor">
                  भारतShop Admin
                </h1>
                <p className="text-sm text-muted-foreground">
                  Franchise Management Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageToggle />
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{user?.username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 border-2 hover:border-destructive hover:shadow-lg"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-2 border-primary/20 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Franchises</p>
                <h3 className="text-3xl font-bold text-primary mt-1">{franchises.length}</h3>
              </div>
              <div className="p-3 bg-primary/20 rounded-full">
                <Store className="h-8 w-8 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-2 border-secondary/20 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <h3 className="text-3xl font-bold text-secondary mt-1">
                  ₹{totalSales.toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="p-3 bg-secondary/20 rounded-full">
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-2 border-accent/20 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <h3 className="text-3xl font-bold text-accent mt-1">{franchises.length}</h3>
              </div>
              <div className="p-3 bg-accent/20 rounded-full">
                <Package className="h-8 w-8 text-accent" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-gradient-card border-2 border-primary/20 shadow-glow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Franchise Management</h2>
              <p className="text-sm text-muted-foreground">Add, edit, or remove franchises</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-fresh border-0 shadow-glow gap-2 hover:scale-105 transition-transform duration-300 hover:shadow-2xl text-white font-semibold px-6 py-2">
                  <Plus className="h-5 w-5" />
                  Add New Franchise
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-gradient-tricolor">
                    Register New Franchise
                  </DialogTitle>
                  <DialogDescription>
                    Enter franchise details. They can login using their email and password.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="franchiseName">
                      <Store className="h-4 w-4 inline mr-2" />
                      Franchise / Store Name
                    </Label>
                    <Input
                      id="franchiseName"
                      placeholder="e.g., Mumbai Fresh Mart"
                      value={newFranchise.franchise_name}
                      onChange={(e) => setNewFranchise({ ...newFranchise, franchise_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shopNumber">
                      <Building className="h-4 w-4 inline mr-2" />
                      Shop Number
                    </Label>
                    <Input
                      id="shopNumber"
                      placeholder="e.g., Shop #123, MG Road"
                      value={newFranchise.shop_number}
                      onChange={(e) => setNewFranchise({ ...newFranchise, shop_number: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="franchise@example.com"
                      value={newFranchise.email}
                      onChange={(e) => setNewFranchise({ ...newFranchise, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      <Lock className="h-4 w-4 inline mr-2" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a secure password"
                      value={newFranchise.password}
                      onChange={(e) => setNewFranchise({ ...newFranchise, password: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleAddFranchise}
                    disabled={loading}
                    className="bg-gradient-fresh border-0 shadow-glow hover:scale-105 transition-all duration-300 hover:shadow-2xl text-white font-semibold px-6 py-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {loading ? 'Registering...' : 'Register Franchise'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Franchise Name</TableHead>
                  <TableHead>Shop Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {franchises.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Store className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No franchises registered yet</p>
                      <p className="text-sm">Click "Add New Franchise" to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  franchises.map((franchise) => (
                    <TableRow key={franchise.id}>
                      <TableCell className="font-medium">
                        {editingId === franchise.id ? (
                          <Input
                            value={editData.franchise_name}
                            onChange={(e) => setEditData({ ...editData, franchise_name: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-primary" />
                            {franchise.franchise_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === franchise.id ? (
                          <Input
                            value={editData.shop_number}
                            onChange={(e) => setEditData({ ...editData, shop_number: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          franchise.shop_number
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === franchise.id ? (
                          <Input
                            value={editData.email}
                            type="email"
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          franchise.email
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === franchise.id ? (
                          <Input
                            value={editData.password}
                            type="password"
                            onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {franchise.password}
                          </code>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(franchise.created_at).toLocaleDateString('en-IN')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green/20 text-green border-green/30">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === franchise.id ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleEditSave(franchise.id)}
                              disabled={loading}
                              className="bg-green hover:bg-green/80 gap-1 text-white border-0 hover:shadow-lg transition-all duration-300 hover:scale-105"
                            >
                              <Save className="h-3 w-3" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleEditCancel}
                              className="gap-1 hover:bg-muted hover:scale-105 transition-all duration-300 border-2"
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditStart(franchise)}
                              className="gap-1 hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-2 hover:border-primary hover:shadow-lg hover:scale-105"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(franchise.id, franchise.franchise_name)}
                              disabled={loading}
                              className="gap-1 hover:bg-destructive/90 hover:shadow-lg transition-all duration-300 hover:scale-105 border-0"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
