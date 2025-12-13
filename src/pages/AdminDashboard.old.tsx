import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, FranchiseData } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
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

export default function AdminDashboard() {
  const { user, logout, deleteFranchiseData } = useAuth();
  const { t } = useLanguage();
  const [franchises, setFranchises] = useState<FranchiseData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FranchiseData>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFranchise, setNewFranchise] = useState({
    franchiseName: '',
    shopNumber: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    loadFranchises();
  }, []);

  const loadFranchises = () => {
    const data = JSON.parse(localStorage.getItem('franchises') || '[]');
    setFranchises(data);
  };

  const handleAddFranchise = () => {
    if (!newFranchise.franchiseName || !newFranchise.shopNumber || !newFranchise.email || !newFranchise.password) {
      toast.error("❌ All fields are required");
      return;
    }

    const franchises = JSON.parse(localStorage.getItem('franchises') || '[]');
    
    if (franchises.some((f: FranchiseData) => f.email === newFranchise.email)) {
      toast.error("❌ Email already exists");
      return;
    }

    const franchise: FranchiseData = {
      id: `franchise-${Date.now()}`,
      ...newFranchise,
      createdAt: new Date().toISOString(),
      sales: 0,
      inventory: [],
      bills: []
    };

    franchises.push(franchise);
    localStorage.setItem('franchises', JSON.stringify(franchises));
    
    loadFranchises();
    setIsAddDialogOpen(false);
    setNewFranchise({ franchiseName: '', shopNumber: '', email: '', password: '' });
    
    toast.success(`✅ Franchise "${franchise.franchiseName}" registered successfully!`, {
      description: `Email: ${franchise.email} | Shop: ${franchise.shopNumber}`
    });
  };

  const handleEditStart = (franchise: FranchiseData) => {
    setEditingId(franchise.id);
    setEditData({
      franchiseName: franchise.franchiseName,
      shopNumber: franchise.shopNumber,
      email: franchise.email,
      password: franchise.password
    });
  };

  const handleEditSave = (id: string) => {
    const franchises = JSON.parse(localStorage.getItem('franchises') || '[]');
    const index = franchises.findIndex((f: FranchiseData) => f.id === id);
    
    if (index !== -1) {
      franchises[index] = { ...franchises[index], ...editData };
      localStorage.setItem('franchises', JSON.stringify(franchises));
      loadFranchises();
      setEditingId(null);
      toast.success("✅ Franchise updated successfully!");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (id: string, franchiseName: string) => {
    if (confirm(`Are you sure you want to delete franchise "${franchiseName}"?`)) {
      const success = deleteFranchiseData(id);
      if (success) {
        loadFranchises();
        toast.success(`✅ Franchise "${franchiseName}" deleted successfully!`);
      }
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("👋 Logged out successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
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
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
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
                  ₹{franchises.reduce((sum, f) => sum + (f.sales || 0), 0).toLocaleString('en-IN')}
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

        {/* Franchises Table */}
        <Card className="p-6 bg-gradient-card border-2 border-primary/20 shadow-glow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Franchise Management</h2>
              <p className="text-sm text-muted-foreground">Add, edit, or remove franchises</p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-fresh border-0 shadow-glow gap-2">
                  <Plus className="h-4 w-4" />
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
                      value={newFranchise.franchiseName}
                      onChange={(e) => setNewFranchise({ ...newFranchise, franchiseName: e.target.value })}
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
                      value={newFranchise.shopNumber}
                      onChange={(e) => setNewFranchise({ ...newFranchise, shopNumber: e.target.value })}
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
                    className="bg-gradient-fresh border-0 shadow-glow"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Register Franchise
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
                            value={editData.franchiseName}
                            onChange={(e) => setEditData({ ...editData, franchiseName: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-primary" />
                            {franchise.franchiseName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === franchise.id ? (
                          <Input
                            value={editData.shopNumber}
                            onChange={(e) => setEditData({ ...editData, shopNumber: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          franchise.shopNumber
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
                          {new Date(franchise.createdAt).toLocaleDateString('en-IN')}
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
                              className="bg-green hover:bg-green/90 gap-1"
                            >
                              <Save className="h-3 w-3" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleEditCancel}
                              className="gap-1"
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
                              className="gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(franchise.id, franchise.franchiseName)}
                              className="gap-1"
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
