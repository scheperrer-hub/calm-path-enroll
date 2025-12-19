import './i18n';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Registration from "./pages/Registration";
import Privacy from "./pages/Privacy";
import Disclaimer from "./pages/Disclaimer";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Registrations from "./pages/admin/Registrations";
import RegistrationDetail from "./pages/admin/RegistrationDetail";
import Board from "./pages/admin/Board";
import Users from "./pages/admin/Users";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/anmeldung" element={<Registration />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/login" element={<Auth />} />
            
            {/* Admin routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="anmeldungen" element={<Registrations />} />
                <Route path="anmeldungen/:id" element={<RegistrationDetail />} />
                <Route path="board" element={<Board />} />
                <Route path="users" element={<Users />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;