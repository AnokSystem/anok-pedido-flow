
import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash } from "lucide-react";
import { ItemPedido } from "@/types";
import { formatarCurrency } from "@/lib/utils";

interface PedidoItensTableProps {
  itensPedido: ItemPedido[];
  unidade: string;
  removerItem: (index: number) => void;
  descontoCliente: number;
  total: number;
}

export function PedidoItensTable({
  itensPedido,
  unidade,
  removerItem,
  descontoCliente,
  total,
}: PedidoItensTableProps) {
  const subtotal = itensPedido.reduce((acc, item) => acc + item.valor_total, 0);
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead className="text-right">Qtd</TableHead>
            <TableHead>Unidade</TableHead>
            {unidade === 'm²' && (
              <TableHead className="text-right">Dimensões</TableHead>
            )}
            <TableHead className="text-right">Valor Unit.</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itensPedido.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                Nenhum item adicionado
              </TableCell>
            </TableRow>
          ) : (
            itensPedido.map((item, index) => (
              <TableRow key={item.id || index}>
                <TableCell>{item.produto?.nome || item.descricao}</TableCell>
                <TableCell className="text-right">{item.quantidade}</TableCell>
                <TableCell>{item.unidade}</TableCell>
                {unidade === 'm²' && (
                  <TableCell className="text-right">
                    {item.largura && item.altura ? `${item.largura} x ${item.altura}` : "-"}
                  </TableCell>
                )}
                <TableCell className="text-right">{formatarCurrency(item.valor_unit)}</TableCell>
                <TableCell className="text-right">{formatarCurrency(item.valor_total)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removerItem(index)}
                    title="Remover item"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-1 items-end p-4 border-t">
        {descontoCliente > 0 && (
          <>
            <div className="text-right text-sm">
              <span className="text-muted-foreground mr-2">Subtotal:</span>
              <span>{formatarCurrency(subtotal)}</span>
            </div>
            <div className="text-right text-sm text-green-600">
              <span className="mr-2">Desconto ({descontoCliente}%):</span>
              <span>-{formatarCurrency(subtotal - total)}</span>
            </div>
          </>
        )}
        <div className="text-right font-semibold">
          <span className="text-muted-foreground mr-2">Total do Pedido:</span>
          <span className="text-lg">{formatarCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
