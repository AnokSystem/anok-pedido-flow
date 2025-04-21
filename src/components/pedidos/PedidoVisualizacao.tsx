
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pedido, Empresa, Cliente } from "@/types";
import { formatarCurrency, formatarData, formatarCpfCnpj } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { supabase } from "@/integrations/supabase/client";

interface PedidoVisualizacaoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: Pedido | null;
}

export function PedidoVisualizacao({ open, onOpenChange, pedido }: PedidoVisualizacaoProps) {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Buscar informações da empresa
  useEffect(() => {
    if (open && pedido) {
      fetchEmpresaInfo();
    }
  }, [open, pedido]);

  const fetchEmpresaInfo = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao carregar informações da empresa:', error);
      } else {
        setEmpresa(data as Empresa);
      }
    } catch (error) {
      console.error('Erro ao buscar informações da empresa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!pedido) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add company logo if exists
      if (empresa?.logo) {
        try {
          doc.addImage(empresa.logo, 'JPEG', 14, 10, 40, 20);
        } catch (e) {
          console.error('Erro ao adicionar logo:', e);
        }
      }
      
      // Add company info
      doc.setFontSize(10);
      if (empresa) {
        doc.text(`${empresa.nome_empresa}`, 14, 35);
        if (empresa.cnpj) doc.text(`CNPJ: ${formatarCpfCnpj(empresa.cnpj)}`, 14, 40);
        if (empresa.endereco) doc.text(`Endereço: ${empresa.endereco}`, 14, 45);
        if (empresa.contato) doc.text(`Contato: ${empresa.contato}`, 14, 50);
        if (empresa.email) doc.text(`Email: ${empresa.email}`, 14, 55);
      }
      
      // Add title
      doc.setFontSize(16);
      doc.text(`PEDIDO: ${pedido.numero_pedido}`, 14, 65);
      
      // Add customer info
      doc.setFontSize(11);
      doc.text(`Cliente: ${pedido.cliente?.nome || 'N/A'}`, 14, 75);
      if (pedido.cliente?.cpf_cnpj) {
        doc.text(`CPF/CNPJ: ${formatarCpfCnpj(pedido.cliente.cpf_cnpj)}`, 14, 80);
      }
      if (pedido.cliente?.contato) {
        doc.text(`Contato: ${pedido.cliente.contato}`, 14, 85);
      }
      if (pedido.cliente?.email) {
        doc.text(`Email: ${pedido.cliente.email}`, 14, 90);
      }
      doc.text(`Data de Emissão: ${formatarData(pedido.data_emissao)}`, 14, 95);
      if (pedido.data_entrega) {
        doc.text(`Data de Entrega: ${formatarData(pedido.data_entrega)}`, 14, 100);
      }
      doc.text(`Status: ${pedido.status}`, 14, 105);
      
      // Add items table
      const tableColumn = ["Item", "Qtd", "Un", "Valor Unit.", "Total"];
      const tableRows = pedido.itens.map(item => {
        const itemDesc = item.produto?.nome || item.descricao || 'N/A';
        let descricaoCompleta = itemDesc;
        
        if (item.largura && item.altura) {
          descricaoCompleta = `${itemDesc} (${item.largura}x${item.altura})`;
        }
        
        return [
          descricaoCompleta,
          item.quantidade.toString(),
          item.unidade,
          formatarCurrency(item.valor_unit),
          formatarCurrency(item.valor_total)
        ];
      });
      
      // @ts-ignore - jspdf-autotable types
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 115,
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      
      // Add total
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(12);
      doc.text(`Total do Pedido: ${formatarCurrency(pedido.total)}`, 130, finalY + 10);
      
      // Add signature fields
      doc.setFontSize(10);
      doc.text("_________________________________", 30, finalY + 40);
      doc.text("Assinatura do Vendedor", 40, finalY + 45);
      
      doc.text("_________________________________", 130, finalY + 40);
      doc.text("Assinatura do Cliente", 140, finalY + 45);
      
      // Add footer with company contact
      doc.setFontSize(9);
      const pageHeight = doc.internal.pageSize.height;
      if (empresa) {
        const footerText = [
          empresa.nome_empresa,
          empresa.contato ? `Tel: ${empresa.contato}` : '',
          empresa.email ? `Email: ${empresa.email}` : '',
          empresa.cnpj ? `CNPJ: ${formatarCpfCnpj(empresa.cnpj)}` : ''
        ].filter(Boolean).join(' - ');
        
        doc.text(footerText, 14, pageHeight - 10, { maxWidth: 180 });
      }
      
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
          {/* Informações da empresa */}
          {empresa && (
            <Card className="border-none shadow-none print:mb-4">
              <CardContent className="p-0">
                <div className="flex flex-col items-center text-center mb-4">
                  {empresa.logo && (
                    <img 
                      src={empresa.logo} 
                      alt={empresa.nome_empresa} 
                      className="max-h-16 mb-2" 
                    />
                  )}
                  <h2 className="text-lg font-bold">{empresa.nome_empresa}</h2>
                  {empresa.cnpj && <p className="text-sm">{formatarCpfCnpj(empresa.cnpj)}</p>}
                  {empresa.endereco && <p className="text-sm">{empresa.endereco}</p>}
                  {empresa.contato && <p className="text-sm">Contato: {empresa.contato}</p>}
                  {empresa.email && <p className="text-sm">Email: {empresa.email}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cabeçalho com informações do pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><span className="font-medium">Cliente:</span> {pedido.cliente?.nome}</p>
                {pedido.cliente?.cpf_cnpj && (
                  <p><span className="font-medium">CPF/CNPJ:</span> {formatarCpfCnpj(pedido.cliente.cpf_cnpj)}</p>
                )}
                {pedido.cliente?.contato && (
                  <p><span className="font-medium">Contato:</span> {pedido.cliente.contato}</p>
                )}
                {pedido.cliente?.email && (
                  <p><span className="font-medium">Email:</span> {pedido.cliente.email}</p>
                )}
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

          {/* Espaço para assinaturas */}
          <Card className="print:mb-0 print:mt-8">
            <CardContent className="p-4 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 mt-4">
                <div className="text-center w-full">
                  <div className="border-t border-gray-300 pt-2 w-full">
                    <p className="text-sm text-gray-600">Assinatura do Vendedor</p>
                  </div>
                </div>
                <div className="text-center w-full">
                  <div className="border-t border-gray-300 pt-2 w-full">
                    <p className="text-sm text-gray-600">Assinatura do Cliente</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
