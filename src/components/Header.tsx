import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface HeaderProps {
  userType?: 'customer' | 'franchise' | null;
  cartCount?: number;
  onLogout?: () => void;
}

export function Header({ userType, cartCount = 0, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {userType === 'customer' && (
            <>
              <Link to="/customer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Shop
              </Link>
              <Link to="/customer/scan" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                AI Scanner
              </Link>
            </>
          )}
          {userType === 'franchise' && (
            <>
              <Link to="/franchise" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/franchise/inventory" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Inventory
              </Link>
              <Link to="/franchise/bills" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Bills
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {userType === 'customer' && (
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          )}
          
          {userType && (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium capitalize">{userType}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border animate-slide-up">
          <nav className="container py-4 flex flex-col gap-2">
            {userType === 'customer' && (
              <>
                <Link 
                  to="/customer" 
                  className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link 
                  to="/customer/scan" 
                  className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Scanner
                </Link>
              </>
            )}
            {userType === 'franchise' && (
              <>
                <Link 
                  to="/franchise" 
                  className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/franchise/inventory" 
                  className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inventory
                </Link>
                <Link 
                  to="/franchise/bills" 
                  className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Bills
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
