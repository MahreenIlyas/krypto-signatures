import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// User pages
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Deposits from "./pages/Deposits";
import Withdrawals from "./pages/Withdrawals";
import Subscriptions from "./pages/Subscriptions";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Components
import { RootRedirect } from "@/components/layout/RootRedirect";

// 404 page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="ADMIN">
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Protected routes with layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="USER">
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/plans" element={
              <ProtectedRoute requiredRole="USER">
                <AppLayout>
                  <Plans />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/deposits" element={
              <ProtectedRoute requiredRole="USER">
                <AppLayout>
                  <Deposits />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/withdrawals" element={
              <ProtectedRoute requiredRole="USER">
                <AppLayout>
                  <Withdrawals />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/subscriptions" element={
              <ProtectedRoute requiredRole="USER">
                <AppLayout>
                  <Subscriptions />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
