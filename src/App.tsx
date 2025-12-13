import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import FranchiseDashboard from "./pages/FranchiseDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode;
  requiredRole?: 'admin' | 'franchise';
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Route Handler Component
function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/franchise" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/franchise" 
        element={
          <ProtectedRoute requiredRole="franchise">
            <FranchiseDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/franchise/billing" 
        element={
          <ProtectedRoute requiredRole="franchise">
            <FranchiseDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/franchise/inventory" 
        element={
          <ProtectedRoute requiredRole="franchise">
            <FranchiseDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/franchise/bills" 
        element={
          <ProtectedRoute requiredRole="franchise">
            <FranchiseDashboard />
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
