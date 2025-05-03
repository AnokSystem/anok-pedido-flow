
import React from "react";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";

interface EmptyPedidoStateProps {
  onCreateNew: () => void;
}

export function EmptyPedidoState({ onCreateNew }: EmptyPedidoStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-muted-foreground mb-4">Nenhum pedido cadastrado</p>
      <Button variant="outline" onClick={onCreateNew}>
        <FilePlus2 className="h-4 w-4 mr-2" />
        Criar primeiro pedido
      </Button>
    </div>
  );
}
