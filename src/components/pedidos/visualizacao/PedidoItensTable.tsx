
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ItemPedido } from "@/types";
import { formatarCurrency } from "@/lib/utils";

interface PedidoItensTableProps {
  itens: ItemPedido[];
  total: number;
}

export function PedidoItensTable({ itens, total }: PedidoItensTableProps) {
  const showDimensoes = itens.some(item => item.largura) || itens.some(item => item.altura);
  
  return (
    <Card className="print-full-width mb-4">
      <CardHeader>
        <CardTitle>Itens do Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Item</th>
                <th className="text-right p-2">Quantidade</th>
                <th className="text-left p-2">Unidade</th>
                {showDimensoes && <th className="text-right p-2">Dimensões</th>}
                <th className="text-right p-2">Valor/Un</th>
                <th className="text-right p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 ? (
                <tr className="border-b">
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    Nenhum item adicionado a este pedido
                  </td>
                </tr>
              ) : (
                itens.map((item, index) => {
                  // Valor por unidade (considerando área para itens m²)
                  let valorPorUnidade = item.valor_unit;
                  if (item.unidade === 'm²' && item.largura && item.altura) {
                    valorPorUnidade = item.valor_unit * item.largura * item.altura;
                  }
                  
                  return (
                    <tr key={item.id || index} className="border-b">
                      <td className="p-2 max-w-[250px] break-words">{item.descricao || item.produto?.nome || '-'}</td>
                      <td className="p-2 text-right">{item.quantidade}</td>
                      <td className="p-2">{item.unidade.toUpperCase()}</td>
                      {showDimensoes && (
                        <td className="p-2 text-right">
                          {item.largura && item.altura
                            ? `${item.largura}m × ${item.altura}m`
                            : '-'}
                        </td>
                      )}
                      <td className="p-2 text-right">{formatarCurrency(valorPorUnidade)}</td>
                      <td className="p-2 text-right">{formatarCurrency(item.valor_total)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
            <tfoot>
              <tr className="font-medium">
                <td colSpan={showDimensoes ? 5 : 4} className="p-3 text-right">
                  Total:
                </td>
                <td className="p-3 text-right">
                  {formatarCurrency(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
