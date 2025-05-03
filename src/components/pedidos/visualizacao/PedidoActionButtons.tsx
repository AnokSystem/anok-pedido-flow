
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface PedidoActionButtonsProps {
  onPrint: () => void;
  onDownload: () => void;
}

export function PedidoActionButtons({ onPrint, onDownload }: PedidoActionButtonsProps) {
  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={onPrint}>
        <Printer className="h-4 w-4 mr-2" />
        Imprimir
      </Button>
      <Button variant="outline" size="sm" onClick={onDownload}>
        <Download className="h-4 w-4 mr-2" />
        Baixar PDF
      </Button>
    </div>
  );
}
