
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pedido } from "@/types";
import { Separator } from "@/components/ui/separator";
import { usePedidoVisualizacao } from "@/hooks/usePedidoVisualizacao";
import { PedidoDocumentHeader } from "./visualizacao/PedidoDocumentHeader";
import { PedidoInfoCard } from "./visualizacao/PedidoInfoCard";
import { PedidoDescricaoCard } from "./visualizacao/PedidoDescricaoCard";
import { PedidoItensTable } from "./visualizacao/PedidoItensTable";
import { PedidoSignatureArea } from "./visualizacao/PedidoSignatureArea";
import { PedidoActionButtons } from "./visualizacao/PedidoActionButtons";

interface PedidoVisualizacaoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: Pedido | null;
}

export function PedidoVisualizacao({ open, onOpenChange, pedido }: PedidoVisualizacaoProps) {
  const { empresa, printRef, handlePrint, handleDownloadPDF } = usePedidoVisualizacao(pedido, open);

  if (!pedido) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95vh] overflow-y-auto dialog-content">
        <DialogHeader className="no-print">
          <DialogTitle className="flex justify-between items-center">
            <span>Pedido: {pedido.numero_pedido}</span>
            <PedidoActionButtons 
              onPrint={handlePrint}
              onDownload={handleDownloadPDF}
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 print-container" id="pedido-para-impressao" ref={printRef}>
          {/* Informações da empresa */}
          <PedidoDocumentHeader empresa={empresa} />

          {/* Cabeçalho com informações do pedido */}
          <PedidoInfoCard pedido={pedido} />

          {/* Separador após informações do pedido */}
          <Separator className="my-4" />

          {/* Descrição do pedido (se existir) */}
          {pedido.descricao && (
            <>
              <PedidoDescricaoCard descricao={pedido.descricao} />
              <Separator className="my-4" />
            </>
          )}

          {/* Tabela de itens do pedido */}
          <PedidoItensTable itens={pedido.itens} total={pedido.total} />

          {/* Separador antes das assinaturas */}
          <Separator className="my-4" />

          {/* Espaço para assinaturas */}
          <PedidoSignatureArea />
        </div>

        <DialogFooter className="no-print">
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
