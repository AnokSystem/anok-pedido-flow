
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Pedido } from "@/types";

interface DeletePedidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPedido?: Pedido;
  onDelete: () => void;
  isLoading: boolean;
}

export function DeletePedidoDialog({
  open,
  onOpenChange,
  selectedPedido,
  onDelete,
  isLoading
}: DeletePedidoDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o pedido 
            "{selectedPedido?.numero_pedido}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} disabled={isLoading}>
            {isLoading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
