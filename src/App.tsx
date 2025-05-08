
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import RegisterClient from "./pages/RegisterClient";
import RegisterLoan from "./pages/RegisterLoan";
import ClientList from "./pages/ClientList";
import ClientDetail from "./pages/ClientDetail";
import LoansList from "./pages/LoansList";
import PaymentsPage from "./pages/PaymentsPage";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate a short loading time to ensure localStorage is checked
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Cargando...</div>;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/register-client" element={
              <ProtectedRoute>
                <Layout><RegisterClient /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/register-loan/:clientId" element={
              <ProtectedRoute>
                <Layout><RegisterLoan /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <Layout><ClientList /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/client/:clientId" element={
              <ProtectedRoute>
                <Layout><ClientDetail /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/loans" element={
              <ProtectedRoute>
                <Layout><LoansList /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute>
                <Layout><PaymentsPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
