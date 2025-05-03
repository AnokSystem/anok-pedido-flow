
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { ItemPedido } from "@/types";
import { formatarCurrency } from "@/lib/utils";

interface PedidoItensProps {
  itensPedido: ItemPedido[];
  unidade: string;
  removerItem: (index: number) => void;
  descontoCliente: number;
  total: number;
}

export function PedidoItens({
  itensPedido,
  removerItem,
  descontoCliente,
  total,
  unidade
}: PedidoItensProps) {
  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Dimensões</TableHead>
              <TableHead className="text-right">Valor Unit.</TableHead>
              <TableHead className="text-right">Valor/Un</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itensPedido.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-4">
                  Nenhum item adicionado
                </TableCell>
              </TableRow>
            ) : (
              itensPedido.map((item, index) => {
                // Valor unitário base (preço por m² ou por unidade)
                const valorUnitario = item.valor_unit;
                
                // Para itens m², o valor por unidade é o preço por m² multiplicado pela área
                let valorPorUnidade = item.valor_unit;
                if (item.unidade === 'm²' && item.largura && item.altura) {
                  valorPorUnidade = item.valor_unit * item.largura * item.altura;
                }
                
                return (
                  <TableRow key={item.id || index}>
                    <TableCell className="max-w-[200px] break-words">{item.descricao}</TableCell>
                    <TableCell>{item.produto?.nome || "Produto"}</TableCell>
                    <TableCell className="text-right">{item.quantidade}</TableCell>
                    <TableCell>{item.unidade}</TableCell>
                    <TableCell className="text-right">
                      {item.unidade === 'm²' && item.largura && item.altura 
                        ? `${item.largura}m × ${item.altura}m` 
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">{formatarCurrency(valorUnitario)}</TableCell>
                    <TableCell className="text-right">{formatarCurrency(valorPorUnidade)}</TableCell>
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
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PedidoTotals descontoCliente={descontoCliente} total={total} />
    </div>
  );
}

interface PedidoTotalsProps {
  descontoCliente: number;
  total: number;
}

function PedidoTotals({ descontoCliente, total }: PedidoTotalsProps) {
  return (
    <div className="flex flex-col gap-1 items-end">
      {descontoCliente > 0 && (
        <>
          <div className="text-right text-sm">
            <span className="text-muted-foreground mr-2">Subtotal:</span>
            <span>{formatarCurrency(total / (1 - descontoCliente / 100))}</span>
          </div>
          <div className="text-right text-sm text-green-600">
            <span className="mr-2">Desconto ({descontoCliente}%):</span>
            <span>-{formatarCurrency(total / (1 - descontoCliente / 100) - total)}</span>
          </div>
        </>
      )}
      
      <div className="text-right font-semibold">
        <span className="text-muted-foreground mr-2">Total do Pedido:</span>
        <span className="text-lg">{formatarCurrency(total)}</span>
      </div>
    </div>
  );
}
