
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pedido } from "@/types";
import { formatarCurrency, formatarData } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

interface PedidoVisualizacaoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: Pedido | null;
}

export function PedidoVisualizacao({ open, onOpenChange, pedido }: PedidoVisualizacaoProps) {
  if (!pedido) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(`Pedido: ${pedido.numero_pedido}`, 14, 22);
      
      // Add customer info
      doc.setFontSize(12);
      doc.text(`Cliente: ${pedido.cliente?.nome || 'N/A'}`, 14, 32);
      doc.text(`Data de Emissão: ${formatarData(pedido.data_emissao)}`, 14, 40);
      doc.text(`Data de Entrega: ${pedido.data_entrega ? formatarData(pedido.data_entrega) : 'N/A'}`, 14, 48);
      doc.text(`Status: ${pedido.status}`, 14, 56);
      
      // Add items table
      const tableColumn = ["Item", "Quantidade", "Unidade", "Valor Unit.", "Total"];
      const tableRows = pedido.itens.map(item => [
        item.produto?.nome || item.descricao || 'N/A',
        item.quantidade.toString(),
        item.unidade,
        formatarCurrency(item.valor_unit),
        formatarCurrency(item.valor_total)
      ]);
      
      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      
      // Add total
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.text(`Total do Pedido: ${formatarCurrency(pedido.total)}`, 14, finalY + 10);
      
      // Save the PDF
      doc.save(`pedido_${pedido.numero_pedido}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso",
        description: `Pedido ${pedido.numero_pedido} foi baixado como PDF.`,
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Pedido: {pedido.numero_pedido}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 print:p-6" id="pedido-para-impressao">
          {/* Cabeçalho com informações do pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><span className="font-medium">Cliente:</span> {pedido.cliente?.nome}</p>
                <p><span className="font-medium">Status:</span> {pedido.status}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-medium">Data de Emissão:</span> {formatarData(pedido.data_emissao)}</p>
                <p>
                  <span className="font-medium">Data de Entrega:</span> {pedido.data_entrega ? formatarData(pedido.data_entrega) : '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de itens do pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Item</th>
                      <th className="text-right py-2 px-3">Quantidade</th>
                      <th className="text-left py-2 px-3">Unidade</th>
                      {(pedido.itens.some(item => item.largura) || pedido.itens.some(item => item.altura)) && (
                        <>
                          <th className="text-right py-2 px-3">Dimensões</th>
                        </>
                      )}
                      <th className="text-right py-2 px-3">Valor Unit.</th>
                      <th className="text-right py-2 px-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.itens.length === 0 ? (
                      <tr className="border-b">
                        <td colSpan={6} className="py-4 text-center text-muted-foreground">
                          Nenhum item adicionado a este pedido
                        </td>
                      </tr>
                    ) : (
                      pedido.itens.map((item, index) => (
                        <tr key={item.id || index} className="border-b">
                          <td className="py-2 px-3">{item.produto?.nome || item.descricao || '-'}</td>
                          <td className="py-2 px-3 text-right">{item.quantidade}</td>
                          <td className="py-2 px-3">{item.unidade.toUpperCase()}</td>
                          {(pedido.itens.some(item => item.largura) || pedido.itens.some(item => item.altura)) && (
                            <td className="py-2 px-3 text-right">
                              {item.largura && item.altura
                                ? `${item.largura} x ${item.altura}`
                                : '-'}
                            </td>
                          )}
                          <td className="py-2 px-3 text-right">{formatarCurrency(item.valor_unit)}</td>
                          <td className="py-2 px-3 text-right">{formatarCurrency(item.valor_total)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="font-medium">
                      <td colSpan={(pedido.itens.some(item => item.largura) || pedido.itens.some(item => item.altura)) ? 5 : 4} className="py-3 px-3 text-right">
                        Total:
                      </td>
                      <td className="py-3 px-3 text-right">
                        {formatarCurrency(pedido.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Endereço de entrega */}
          {pedido.cliente && (
            <Card>
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {[
                    pedido.cliente.rua,
                    pedido.cliente.numero && `Nº ${pedido.cliente.numero}`,
                    pedido.cliente.bairro,
                    pedido.cliente.cidade
                  ].filter(Boolean).join(', ')}
                </p>
                <p className="mt-2">
                  <span className="font-medium">Contato:</span> {pedido.cliente.contato || '-'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
