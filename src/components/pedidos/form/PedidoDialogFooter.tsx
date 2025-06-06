
import React from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PedidoDialogFooterProps {
  onCancel: () => void;
  isLoading: boolean;
  editMode: boolean;
}

export function PedidoDialogFooter({ 
  onCancel, 
  isLoading, 
  editMode 
}: PedidoDialogFooterProps) {
  return (
    <DialogFooter className="gap-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : editMode ? "Atualizar" : "Salvar"}
      </Button>
    </DialogFooter>
  );
}
