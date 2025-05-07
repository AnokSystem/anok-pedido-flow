
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusPedidoChart } from "@/components/dashboard/StatusPedidoChart";
import { VendasMensaisChart } from "@/components/dashboard/VendasMensaisChart";
import { UltimosPedidos } from "@/components/dashboard/UltimosPedidos";
import { PaymentStatusChart } from "@/components/dashboard/PaymentStatusChart";
import { FileText, Package, ShoppingBag, Users } from "lucide-react";
import { formatarCurrency } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";
import { usePedidos } from "@/hooks/usePedidos";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useDashboard();
  const { pedidos, isLoading: isLoadingPedidos } = usePedidos();

  // Get the last 5 orders
  const ultimosPedidos = pedidos?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Visão geral do seu negócio"
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingStats ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard 
              title="Total de Pedidos" 
              value={stats?.totalPedidos || 0} 
              icon={<FileText className="h-4 w-4" />}
            />
            <StatCard 
              title="Valor Total" 
              value={formatarCurrency(stats?.valorTotal || 0)} 
              icon={<ShoppingBag className="h-4 w-4" />}
            />
            <StatCard 
              title="Clientes" 
              value={stats?.totalClientes || 0} 
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard 
              title="Produtos" 
              value={stats?.totalProdutos || 0} 
              icon={<Package className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoadingStats ? (
            <Skeleton className="h-80" />
          ) : (
            <VendasMensaisChart data={stats?.pedidosPorMes || []} />
          )}
        </div>
        <div>
          {isLoadingStats ? (
            <Skeleton className="h-80" />
          ) : (
            <StatusPedidoChart data={stats?.pedidosPorStatus || []} />
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoadingPedidos ? (
            <Skeleton className="h-96" />
          ) : (
            <UltimosPedidos pedidos={ultimosPedidos} />
          )}
        </div>
        <div>
          {isLoadingStats ? (
            <Skeleton className="h-80" />
          ) : (
            stats?.pedidosPorPagamento && 
            <PaymentStatusChart data={stats?.pedidosPorPagamento || []} />
          )}
        </div>
      </div>
    </div>
  );
}
