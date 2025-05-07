
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, StatusPedido, PaymentStatus } from '@/types';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Fetch total number of orders
      const { count: totalPedidos } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true });

      // Fetch total value of orders
      const { data: valorTotalData } = await supabase
        .from('pedidos')
        .select('total');
      const valorTotal = valorTotalData?.reduce((sum, pedido) => sum + Number(pedido.total), 0) || 0;

      // Fetch total number of clients
      const { count: totalClientes } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      // Fetch total number of products
      const { count: totalProdutos } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true });

      // Fetch orders by status
      const { data: statusData } = await supabase
        .from('pedidos')
        .select('status');
      
      const pedidosPorStatus = statusData?.reduce((acc, pedido) => {
        const status = pedido.status as StatusPedido;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<StatusPedido, number>);

      const statusCount = Object.entries(pedidosPorStatus || {}).map(([status, count]) => ({
        status: status as StatusPedido,
        count,
      }));

      // Fetch orders by payment status
      const { data: paymentData } = await supabase
        .from('pedidos')
        .select('payment_status, total');
      
      const pedidosPorPagamento = paymentData?.reduce((acc, pedido) => {
        const status = pedido.payment_status as PaymentStatus || 'Pendente';
        if (!acc[status]) {
          acc[status] = { count: 0, valor: 0 };
        }
        acc[status].count += 1;
        acc[status].valor += Number(pedido.total);
        return acc;
      }, {} as Record<PaymentStatus, { count: number, valor: number }>);

      const paymentStats = pedidosPorPagamento ? Object.entries(pedidosPorPagamento).map(([status, data]) => ({
        status: status as PaymentStatus,
        count: data.count,
        valor: data.valor
      })) : [];

      // Fetch orders by month
      const { data: monthlyData } = await supabase
        .from('pedidos')
        .select('data_emissao, total')
        .gte('data_emissao', new Date(new Date().getFullYear(), 0, 1).toISOString());

      const pedidosPorMes = monthlyData?.reduce((acc, pedido) => {
        const month = new Date(pedido.data_emissao).getMonth();
        const monthName = new Date(2024, month).toLocaleString('pt-BR', { month: 'short' });
        acc[monthName] = (acc[monthName] || 0) + Number(pedido.total);
        return acc;
      }, {} as Record<string, number>);

      const monthlyStats = Object.entries(pedidosPorMes || {}).map(([mes, valor]) => ({
        mes,
        valor,
      }));

      return {
        totalPedidos: totalPedidos || 0,
        valorTotal,
        totalClientes: totalClientes || 0,
        totalProdutos: totalProdutos || 0,
        pedidosPorStatus: statusCount,
        pedidosPorMes: monthlyStats,
        pedidosPorPagamento: paymentStats,
      } as DashboardStats;
    },
  });
}
