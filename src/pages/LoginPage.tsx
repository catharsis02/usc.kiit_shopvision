import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageToggle } from "@/components/LanguageToggle";
import { toast } from "sonner";
import { 
  Lock, 
  Mail, 
  Store, 
  Shield, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Sparkles,
  ShoppingBag
} from "lucide-react";

export default function LoginPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Admin form
  const [adminForm, setAdminForm] = useState({
    username: '',
    password: ''
  });

  // Franchise form
  const [franchiseForm, setFranchiseForm] = useState({
    email: '',
    password: ''
  });

  const { login } = useAuth();
  const { t } = useLanguage();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(adminForm.username, adminForm.password);
      if (success) {
        toast.success("🎉 Admin login successful!", {
          description: `Welcome back, ${adminForm.username}!`
        });
      } else {
        toast.error("❌ Login failed", {
          description: "Invalid admin credentials"
        });
      }
    } catch (error) {
      toast.error("❌ An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFranchiseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(franchiseForm.email, franchiseForm.password);
      if (success) {
        toast.success("🎉 Welcome back!", {
          description: "Logged in successfully"
        });
      } else {
        toast.error("❌ Login failed", {
          description: "Invalid email or password"
        });
      }
    } catch (error) {
      toast.error("❌ An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-96 h-96 opacity-10"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" className="text-secondary" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 opacity-10"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" className="text-secondary" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent" />
          </svg>
        </motion.div>
      </div>

      {/* Language Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10"
      >
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block text-center lg:text-left"
        >
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="p-4 rounded-2xl bg-gradient-fresh shadow-glow"
            >
              <ShoppingBag className="h-12 w-12 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-display font-bold text-gradient-tricolor">
                भारतShop
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Indian Grocery Management
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 mb-8"
          >
            <h2 className="text-3xl font-bold text-foreground">
              Transform Your Store
            </h2>
            <p className="text-muted-foreground text-lg">
              Modern AI-powered grocery management system designed for Indian stores
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Sparkles, text: "AI Billing", color: "text-primary" },
              { icon: ShoppingBag, text: "Inventory", color: "text-secondary" },
              { icon: Store, text: "Analytics", color: "text-accent" },
              { icon: Shield, text: "Secure", color: "text-primary" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
              >
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
                <span className="font-medium text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-8 shadow-glow bg-gradient-card border-2 border-primary/20">
            {/* Role Selection Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={!isAdmin ? "default" : "outline"}
                className={`flex-1 gap-2 transition-all duration-300 hover:scale-105 ${!isAdmin ? 'bg-gradient-fresh border-0 shadow-glow hover:shadow-2xl' : 'border-primary/50 hover:bg-primary/10 hover:border-primary'}`}
                onClick={() => {
                  setIsAdmin(false);
                  setAdminForm({ username: '', password: '' });
                  setFranchiseForm({ email: '', password: '' });
                }}
              >
                <Store className="h-4 w-4" />
                Franchise Login
              </Button>
              <Button
                type="button"
                variant={isAdmin ? "default" : "outline"}
                className={`flex-1 gap-2 transition-all duration-300 hover:scale-105 ${isAdmin ? 'bg-gradient-fresh border-0 shadow-glow hover:shadow-2xl' : 'border-primary/50 hover:bg-primary/10 hover:border-primary'}`}
                onClick={() => {
                  setIsAdmin(true);
                  setAdminForm({ username: '', password: '' });
                  setFranchiseForm({ email: '', password: '' });
                }}
              >
                <Shield className="h-4 w-4" />
                Admin Login
              </Button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isAdmin ? 'admin' : 'franchise'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {isAdmin ? "🛡️ Admin Access" : "👋 Franchise Login"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {isAdmin 
                      ? "Administrative portal - manage franchises" 
                      : "Login with your registered email"}
                  </p>
                </div>

                {/* Admin Login Form */}
                {isAdmin ? (
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-username" className="text-foreground font-medium">
                        <Shield className="h-4 w-4 inline mr-2" />
                        Admin Username
                      </Label>
                      <Input
                        id="admin-username"
                        placeholder="admin"
                        value={adminForm.username}
                        onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                        className="border-primary/30 focus:border-primary"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-password" className="text-foreground font-medium">
                        <Lock className="h-4 w-4 inline mr-2" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={adminForm.password}
                          onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                          className="border-primary/30 focus:border-primary pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-fresh border-0 shadow-glow text-lg py-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 font-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <>
                          Admin Login
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  /* Franchise Login Form */
                  <form onSubmit={handleFranchiseLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="franchise-email" className="text-foreground font-medium">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email Address
                      </Label>
                      <Input
                        id="franchise-email"
                        type="email"
                        placeholder="your-email@example.com"
                        value={franchiseForm.email}
                        onChange={(e) => setFranchiseForm({ ...franchiseForm, email: e.target.value })}
                        className="border-primary/30 focus:border-primary"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="franchise-password" className="text-foreground font-medium">
                        <Lock className="h-4 w-4 inline mr-2" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="franchise-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={franchiseForm.password}
                          onChange={(e) => setFranchiseForm({ ...franchiseForm, password: e.target.value })}
                          className="border-primary/30 focus:border-primary pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-fresh border-0 shadow-glow text-lg py-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 font-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <>
                          Login to Dashboard
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <div className="text-center pt-4">
                      <p className="text-sm text-muted-foreground">
                        Don't have an account? Contact admin to register your franchise
                      </p>
                    </div>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </Card>

          {/* Demo Credentials - Admin Only */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 backdrop-blur-sm"
            >
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    🎯 Demo Login Credentials
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      <Shield className="h-3 w-3 inline mr-1" />
                      <strong>Admin:</strong>
                    </p>
                    <div className="bg-background/50 p-2 rounded border border-border/50">
                      <code className="text-xs text-primary">
                        Username: <span className="font-bold">admin</span>
                      </code>
                      <br />
                      <code className="text-xs text-primary">
                        Password: <span className="font-bold">admin123</span>
                      </code>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminForm({ username: 'admin', password: 'admin123' })}
                className="w-full mt-2 text-xs text-center text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Click to fill demo credentials
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Floating Decorative Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-10 w-16 h-16 rounded-full bg-gradient-fresh opacity-20 blur-xl"
      />
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 right-20 w-20 h-20 rounded-full bg-gradient-warm opacity-20 blur-xl"
      />
    </div>
  );
}
