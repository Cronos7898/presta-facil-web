
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import RegisterClient from "./pages/RegisterClient";
import RegisterLoan from "./pages/RegisterLoan";
import ClientList from "./pages/ClientList";
import ClientDetail from "./pages/ClientDetail";
import LoansList from "./pages/LoansList";
import PaymentsPage from "./pages/PaymentsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/register-client" element={<Layout><RegisterClient /></Layout>} />
          <Route path="/register-loan/:clientId" element={<Layout><RegisterLoan /></Layout>} />
          <Route path="/clients" element={<Layout><ClientList /></Layout>} />
          <Route path="/client/:clientId" element={<Layout><ClientDetail /></Layout>} />
          <Route path="/loans" element={<Layout><LoansList /></Layout>} />
          <Route path="/payments" element={<Layout><PaymentsPage /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
