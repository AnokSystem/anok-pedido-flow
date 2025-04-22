import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";

// Páginas
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Pedidos from "./pages/Pedidos";
import Configuracoes from "./pages/Configuracoes";
import Ajuda from "./pages/Ajuda";
import NotFound from "./pages/NotFound";
import Perfil from "./pages/Perfil";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/clientes" element={<AppLayout><Clientes /></AppLayout>} />
          <Route path="/produtos" element={<AppLayout><Produtos /></AppLayout>} />
          <Route path="/pedidos" element={<AppLayout><Pedidos /></AppLayout>} />
          <Route path="/perfil" element={<AppLayout><Perfil /></AppLayout>} />
          <Route path="/configuracoes" element={<AppLayout><Configuracoes /></AppLayout>} />
          <Route path="/ajuda" element={<AppLayout><Ajuda /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
