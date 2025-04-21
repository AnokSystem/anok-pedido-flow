
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatarCurrency, formatarData } from "@/lib/utils";
import { Copy, Edit, FilePlus2, Printer, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { usePedidos } from "@/hooks/usePedidos";

const statusColors = {
  'Criado': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'Em Produção': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  'Pronto': 'bg-green-100 text-green-800 hover:bg-green-200',
  'Entregue': 'bg-gray-100 text-gray-800 hover:bg-gray-200'
};

export default function Pedidos() {
  const { pedidos, isLoading } = usePedidos();

  if (isLoading) {
    return <div>Carregando pedidos...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Pedidos" 
        subtitle="Gerencie seus pedidos de clientes"
        actions={
          <Button className="gap-1">
            <FilePlus2 className="h-4 w-4" />
            <span>Novo Pedido</span>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Data Entrega</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos?.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell className="font-medium">
                    <Link to={`/pedidos/${pedido.id}`} className="hover:text-anok-500 transition-colors">
                      {pedido.numero_pedido}
                    </Link>
                  </TableCell>
                  <TableCell>{pedido.cliente?.nome}</TableCell>
                  <TableCell>{formatarData(pedido.data_emissao)}</TableCell>
                  <TableCell>{pedido.data_entrega ? formatarData(pedido.data_entrega) : '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={statusColors[pedido.status]}
                    >
                      {pedido.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatarCurrency(pedido.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Imprimir">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Clonar">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Excluir">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
