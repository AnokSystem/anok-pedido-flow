
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pedido, Empresa } from "@/types";
import { toast } from "@/hooks/use-toast";
import { generatePedidoPDF } from "@/services/pdfService";

export function usePedidoVisualizacao(pedido: Pedido | null, open: boolean) {
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!pedido) return;
    
    try {
      const doc = generatePedidoPDF(pedido, empresa);
      
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

  return {
    empresa,
    isLoading,
    printRef,
    handlePrint,
    handleDownloadPDF
  };
}
