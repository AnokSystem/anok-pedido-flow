
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusPedidoChart } from "@/components/dashboard/StatusPedidoChart";
import { VendasMensaisChart } from "@/components/dashboard/VendasMensaisChart";
import { UltimosPedidos } from "@/components/dashboard/UltimosPedidos";
import { dashboardStatsMock, pedidosMock } from "@/lib/mockData";
import { FileText, Package, ShoppingBag, Users } from "lucide-react";
import { formatarCurrency } from "@/lib/utils";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Visão geral do seu negócio"
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total de Pedidos" 
          value={dashboardStatsMock.totalPedidos} 
          icon={<FileText className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard 
          title="Valor Total" 
          value={formatarCurrency(dashboardStatsMock.valorTotal)} 
          icon={<ShoppingBag className="h-4 w-4" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard 
          title="Clientes" 
          value={dashboardStatsMock.totalClientes} 
          icon={<Users className="h-4 w-4" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard 
          title="Produtos" 
          value={dashboardStatsMock.totalProdutos} 
          icon={<Package className="h-4 w-4" />}
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VendasMensaisChart data={dashboardStatsMock.pedidosPorMes} />
        </div>
        <div>
          <StatusPedidoChart data={dashboardStatsMock.pedidosPorStatus} />
        </div>
      </div>

      <div>
        <UltimosPedidos pedidos={pedidosMock} />
      </div>
    </div>
  );
}
