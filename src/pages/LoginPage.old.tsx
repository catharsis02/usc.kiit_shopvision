import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { toast } from "sonner";
import { 
  Lock, 
  User, 
  Store, 
  Shield, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Sparkles,
  ShoppingBag
} from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    franchiseName: ''
  });

  const { login, registerFranchise } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const success = await login(formData.username, formData.password);
        if (success) {
          toast.success(
            isAdmin ? "🎉 Admin login successful!" : "🎉 Welcome back!",
            { description: `Logged in as ${formData.username}` }
          );
        } else {
          toast.error("❌ Login failed", {
            description: "Invalid username or password"
          });
        }
      } else {
        // Register Franchise
        if (!formData.franchiseName.trim()) {
          toast.error("❌ Store name required");
          setLoading(false);
          return;
        }
        
        const success = await registerFranchise(
          formData.username, 
          formData.password, 
          formData.franchiseName
        );
        
        if (success) {
          toast.success("🎊 Registration successful!", {
            description: `Welcome to BharatShop, ${formData.franchiseName}!`
          });
        } else {
          toast.error("❌ Registration failed", {
            description: "Username already exists"
          });
        }
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

        {/* Right Side - Login/Register Form */}
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
                className={`flex-1 gap-2 ${!isAdmin ? 'bg-gradient-fresh border-0 shadow-glow' : 'border-primary/50'}`}
                onClick={() => {
                  setIsAdmin(false);
                  setFormData({ username: '', password: '', franchiseName: '' });
                }}
              >
                <Store className="h-4 w-4" />
                Franchise
              </Button>
              <Button
                type="button"
                variant={isAdmin ? "default" : "outline"}
                className={`flex-1 gap-2 ${isAdmin ? 'bg-gradient-fresh border-0 shadow-glow' : 'border-primary/50'}`}
                onClick={() => {
                  setIsAdmin(true);
                  setIsLogin(true);
                  setFormData({ username: '', password: '', franchiseName: '' });
                }}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {isAdmin 
                      ? "🛡️ Admin Access" 
                      : isLogin 
                        ? "👋 Welcome Back!" 
                        : "🎊 Join BharatShop"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {isAdmin 
                      ? "Administrative portal access" 
                      : isLogin 
                        ? "Login to your franchise dashboard" 
                        : "Create your franchise account"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Franchise Name (Register only) */}
                  {!isLogin && !isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="franchiseName" className="text-foreground font-medium">
                        <Store className="h-4 w-4 inline mr-2" />
                        Store / Franchise Name
                      </Label>
                      <Input
                        id="franchiseName"
                        placeholder="e.g., Mumbai Fresh Mart"
                        value={formData.franchiseName}
                        onChange={(e) => setFormData({ ...formData, franchiseName: e.target.value })}
                        className="border-primary/30 focus:border-primary"
                        required={!isLogin}
                      />
                    </motion.div>
                  )}

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-foreground font-medium">
                      <User className="h-4 w-4 inline mr-2" />
                      Username
                    </Label>
                    <Input
                      id="username"
                      placeholder={isAdmin ? "admin" : "your-username"}
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="border-primary/30 focus:border-primary"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">
                      <Lock className="h-4 w-4 inline mr-2" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-fresh border-0 shadow-glow text-lg py-6"
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
                        {isLogin ? "Login" : "Create Account"}
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Toggle Login/Register */}
                  {!isAdmin && (
                    <div className="text-center pt-4">
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {isLogin ? (
                          <>Don't have an account? <span className="font-semibold text-primary">Register here</span></>
                        ) : (
                          <>Already have an account? <span className="font-semibold text-primary">Login here</span></>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            </AnimatePresence>
          </Card>

          {/* Quick Hint */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-center"
            >
              <p className="text-xs text-muted-foreground">
                <Shield className="h-3 w-3 inline mr-1" />
                Admin credentials: <code className="bg-primary/20 px-2 py-0.5 rounded">admin / @Alakh123</code>
              </p>
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
