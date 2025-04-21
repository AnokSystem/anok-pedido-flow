
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarData } from "@/lib/utils";
import { Pedido, StatusPedido } from "@/types";
import { Link } from "react-router-dom";

interface UltimosPedidosProps {
  pedidos: Pedido[];
}

const statusColors: Record<StatusPedido, string> = {
  'Criado': 'bg-blue-100 text-blue-800',
  'Em Produção': 'bg-yellow-100 text-yellow-800',
  'Pronto': 'bg-green-100 text-green-800',
  'Entregue': 'bg-gray-100 text-gray-800'
};

export function UltimosPedidos({ pedidos }: UltimosPedidosProps) {
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Últimos Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex flex-col">
                <Link 
                  to={`/pedidos/${pedido.id}`} 
                  className="font-medium hover:text-anok-500 transition-colors"
                >
                  {pedido.numero_pedido}
                </Link>
                <span className="text-sm text-muted-foreground">{pedido.cliente?.nome}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                  <div className="font-medium">{formatarValor(pedido.total)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatarData(pedido.data_emissao)}
                  </div>
                </div>
                <div className="min-w-20 text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[pedido.status]}`}>
                    {pedido.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className="text-center mt-4">
            <Link to="/pedidos" className="text-sm text-anok-500 hover:text-anok-600 font-medium">
              Ver todos os pedidos →
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
