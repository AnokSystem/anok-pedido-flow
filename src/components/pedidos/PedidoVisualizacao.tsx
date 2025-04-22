
import React, { useEffect, useState, useRef } from "react";
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
import autoTable from 'jspdf-autotable';

interface PedidoVisualizacaoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: Pedido | null;
}

export function PedidoVisualizacao({ open, onOpenChange, pedido }: PedidoVisualizacaoProps) {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Buscar informações da empresa
  useEffect(() => {
    if (open && pedido) {
      fetchEmpresaInfo();
    }
  }, [open, pedido]);

  // Add print-specific styles when component mounts
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .Dialog__overlay, .dialog-overlay {
          display: none !important;
        }
        #pedido-para-impressao, #pedido-para-impressao * {
          visibility: visible !important;
          display: block !important;
        }
        #pedido-para-impressao {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: auto;
          padding: 20px;
          background-color: white;
          overflow: visible !important;
        }
        .no-print {
          display: none !important;
        }
        .print-full-width {
          width: 100% !important;
        }
        .print-container {
          display: block !important;
          page-break-inside: avoid;
          overflow: visible !important;
        }
        .print-mb-4 {
          margin-bottom: 1rem !important;
        }
        .print-mt-8 {
          margin-top: 2rem !important;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          display: table !important;
        }
        thead {
          display: table-header-group !important;
        }
        tbody {
          display: table-row-group !important;
        }
        tr {
          display: table-row !important;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          display: table-cell !important;
        }
        th {
          background-color: #f2f2f2;
        }
        .dialog-content {
          transform: none !important;
          position: static !important;
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          max-width: none !important;
          max-height: none !important;
          overflow: visible !important;
          box-shadow: none !important;
          border: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      const printStyles = document.getElementById('print-styles');
      if (printStyles) {
        printStyles.remove();
      }
    };
  }, []);

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
      
      // Set up for company info next to logo
      let startY = 15;
      let logoWidth = 0;
      
      // Add company logo if exists
      if (empresa?.logo) {
        try {
          // Add the logo to the left side
          logoWidth = 40;
          doc.addImage(empresa.logo, 'JPEG', 14, startY, logoWidth, 20);
        } catch (e) {
          console.error('Erro ao adicionar logo:', e);
        }
      }
      
      // Add company info next to logo
      doc.setFontSize(10);
      if (empresa) {
        // Position company info to the right of the logo
        const infoX = logoWidth > 0 ? 60 : 14; // If logo exists, start text after logo
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${empresa.nome_empresa}`, infoX, startY + 5);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        let currentY = startY + 10;
        if (empresa.cnpj) {
          doc.text(`CNPJ: ${formatarCpfCnpj(empresa.cnpj)}`, infoX, currentY);
          currentY += 5;
        }
        if (empresa.endereco) {
          doc.text(`Endereço: ${empresa.endereco}`, infoX, currentY);
          currentY += 5;
        }
        if (empresa.contato) {
          doc.text(`Contato: ${empresa.contato}`, infoX, currentY);
          currentY += 5;
        }
        if (empresa.email) {
          doc.text(`Email: ${empresa.email}`, infoX, currentY);
          currentY += 5;
        }
        
        startY = Math.max(startY + 25, currentY + 5); // Update startY to be below both logo and company info
      }
      
      // Add title
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(`PEDIDO: ${pedido.numero_pedido}`, 14, startY);
      doc.setFont(undefined, 'normal');
      startY += 10;
      
      // Add customer info
      doc.setFontSize(11);
      doc.text(`Cliente: ${pedido.cliente?.nome || 'N/A'}`, 14, startY);
      startY += 5;
      
      if (pedido.cliente?.cpf_cnpj) {
        doc.text(`CPF/CNPJ: ${formatarCpfCnpj(pedido.cliente.cpf_cnpj)}`, 14, startY);
        startY += 5;
      }
      if (pedido.cliente?.contato) {
        doc.text(`Contato: ${pedido.cliente.contato}`, 14, startY);
        startY += 5;
      }
      if (pedido.cliente?.email) {
        doc.text(`Email: ${pedido.cliente.email}`, 14, startY);
        startY += 5;
      }
      
      doc.text(`Data de Emissão: ${formatarData(pedido.data_emissao)}`, 14, startY);
      startY += 5;
      
      if (pedido.data_entrega) {
        doc.text(`Data de Entrega: ${formatarData(pedido.data_entrega)}`, 14, startY);
        startY += 5;
      }
      
      doc.text(`Status: ${pedido.status}`, 14, startY);
      startY += 10;
      
      // Add description if exists
      if (pedido.descricao) {
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Descrição:', 14, startY);
        doc.setFont(undefined, 'normal');
        startY += 5;
        
        const splitDescription = doc.splitTextToSize(pedido.descricao, 180);
        doc.text(splitDescription, 14, startY);
        startY += splitDescription.length * 5 + 5;
      }
      
      // Add items table
      const tableColumn = ["Item", "Qtd", "Un", "Dimensões", "Valor Unit.", "Total"];
      const tableRows = pedido.itens.map(item => {
        const itemDesc = item.produto?.nome || item.descricao || 'N/A';
        
        return [
          itemDesc,
          item.quantidade.toString(),
          item.unidade,
          item.largura && item.altura ? `${item.largura}x${item.altura}` : '-',
          formatarCurrency(item.valor_unit),
          formatarCurrency(item.valor_total)
        ];
      });
      
      // Use autoTable properly
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: startY,
        theme: 'grid',
        styles: { fontSize: 10 }
      });
      
      // Add total
      const finalY = (doc as any).lastAutoTable?.finalY || 150;
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto dialog-content">
        <DialogHeader className="no-print">
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

        <div className="space-y-4 print-container" id="pedido-para-impressao" ref={printRef}>
          {/* Informações da empresa */}
          {empresa && (
            <Card className="border-none shadow-none print-mb-4">
              <CardContent className="p-0">
                <div className="flex flex-row items-center mb-4">
                  {empresa.logo && (
                    <div className="mr-4">
                      <img 
                        src={empresa.logo} 
                        alt={empresa.nome_empresa} 
                        className="max-h-20" 
                      />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <h2 className="text-lg font-bold">{empresa.nome_empresa}</h2>
                    {empresa.cnpj && <p className="text-sm">{formatarCpfCnpj(empresa.cnpj)}</p>}
                    {empresa.endereco && <p className="text-sm">{empresa.endereco}</p>}
                    {empresa.contato && <p className="text-sm">Contato: {empresa.contato}</p>}
                    {empresa.email && <p className="text-sm">Email: {empresa.email}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cabeçalho com informações do pedido */}
          <Card className="print-full-width mb-4">
            <CardHeader>
              <CardTitle>Informações do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><span className="font-medium">Número do Pedido:</span> {pedido.numero_pedido}</p>
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

          {/* Descrição do pedido (se existir) */}
          {pedido.descricao && (
            <Card className="print-full-width mb-4">
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{pedido.descricao}</p>
              </CardContent>
            </Card>
          )}

          {/* Tabela de itens do pedido */}
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
                      {(pedido.itens.some(item => item.largura) || pedido.itens.some(item => item.altura)) && (
                        <th className="text-right p-2">Dimensões</th>
                      )}
                      <th className="text-right p-2">Valor Unit.</th>
                      <th className="text-right p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.itens.length === 0 ? (
                      <tr className="border-b">
                        <td colSpan={6} className="p-4 text-center text-muted-foreground">
                          Nenhum item adicionado a este pedido
                        </td>
                      </tr>
                    ) : (
                      pedido.itens.map((item, index) => (
                        <tr key={item.id || index} className="border-b">
                          <td className="p-2">{item.produto?.nome || item.descricao || '-'}</td>
                          <td className="p-2 text-right">{item.quantidade}</td>
                          <td className="p-2">{item.unidade.toUpperCase()}</td>
                          {(pedido.itens.some(item => item.largura) || pedido.itens.some(item => item.altura)) && (
                            <td className="p-2 text-right">
                              {item.largura && item.altura
                                ? `${item.largura} x ${item.altura}`
                                : '-'}
                            </td>
                          )}
                          <td className="p-2 text-right">{formatarCurrency(item.valor_unit)}</td>
                          <td className="p-2 text-right">{formatarCurrency(item.valor_total)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="font-medium">
                      <td colSpan={(pedido.itens.some(item => item.largura) || pedido.itens.some(item => item.altura)) ? 5 : 4} className="p-3 text-right">
                        Total:
                      </td>
                      <td className="p-3 text-right">
                        {formatarCurrency(pedido.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Espaço para assinaturas */}
          <Card className="print-mb-0 print-mt-8 border-none shadow-none">
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

        <DialogFooter className="no-print">
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
