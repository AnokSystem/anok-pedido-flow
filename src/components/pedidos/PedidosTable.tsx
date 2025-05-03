
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, Eye, Printer, Trash } from "lucide-react";
import { formatarCurrency, formatarData } from "@/lib/utils";
import { Pedido } from "@/types";

interface PedidosTableProps {
  pedidos?: Pedido[];
  onView: (pedido: Pedido) => void;
  onPrint: (pedido: Pedido) => void;
  onEdit: (pedido: Pedido) => void;
  onClone: (pedido: Pedido) => void;
  onDelete: (pedido: Pedido) => void;
  isLoading: boolean;
}

const statusColors = {
  'Criado': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'Em Produção': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  'Pronto': 'bg-green-100 text-green-800 hover:bg-green-200',
  'Entregue': 'bg-gray-100 text-gray-800 hover:bg-gray-200'
};

export function PedidosTable({
  pedidos,
  onView,
  onPrint,
  onEdit,
  onClone,
  onDelete,
  isLoading
}: PedidosTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  if (!pedidos || pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground mb-4">Nenhum pedido cadastrado</p>
      </div>
    );
  }

  return (
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
        {pedidos.map((pedido) => (
          <TableRow key={pedido.id}>
            <TableCell className="font-medium">
              <Button
                variant="link"
                className="p-0 h-auto font-medium hover:text-anok-500"
                onClick={() => onView(pedido)}
              >
                {pedido.numero_pedido}
              </Button>
            </TableCell>
            <TableCell>{pedido.cliente?.nome}</TableCell>
            <TableCell>{formatarData(pedido.data_emissao)}</TableCell>
            <TableCell>{pedido.data_entrega ? formatarData(pedido.data_entrega) : '-'}</TableCell>
            <TableCell>
              <Badge 
                variant="secondary" 
                className={statusColors[pedido.status as keyof typeof statusColors]}
              >
                {pedido.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {formatarCurrency(pedido.total)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Visualizar"
                  onClick={() => onView(pedido)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Imprimir"
                  onClick={() => onPrint(pedido)}
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Editar"
                  onClick={() => onEdit(pedido)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Clonar"
                  onClick={() => onClone(pedido)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Excluir"
                  onClick={() => onDelete(pedido)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
