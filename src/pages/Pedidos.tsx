
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { FilePlus2 } from "lucide-react";
import { PedidoForm } from "@/components/pedidos/PedidoForm";
import { PedidoVisualizacao } from "@/components/pedidos/PedidoVisualizacao";
import { DeletePedidoDialog } from "@/components/pedidos/DeletePedidoDialog";
import { PedidosTable } from "@/components/pedidos/PedidosTable";
import { EmptyPedidoState } from "@/components/pedidos/EmptyPedidoState";
import { usePedidosPage } from "@/hooks/usePedidosPage";

export default function Pedidos() {
  const {
    pedidos,
    isLoading,
    formOpen,
    visualizacaoOpen,
    confirmDeleteOpen,
    selectedPedido,
    pedidoParaVisualizar,
    isSubmitting,
    isActionLoading,
    setFormOpen,
    setVisualizacaoOpen,
    setConfirmDeleteOpen,
    handleOpenNewForm,
    handleOpenEditForm,
    handleOpenVisualizacao,
    handleOpenDeleteConfirm,
    handleImprimir,
    handleClonar,
    handleDelete,
    handleSubmit
  } = usePedidosPage();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Pedidos" 
        subtitle="Gerencie seus pedidos de clientes"
        actions={
          <Button className="gap-1" onClick={handleOpenNewForm}>
            <FilePlus2 className="h-4 w-4" />
            <span>Novo Pedido</span>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Carregando pedidos...</p>
            </div>
          ) : !pedidos || pedidos.length === 0 ? (
            <EmptyPedidoState onCreateNew={handleOpenNewForm} />
          ) : (
            <PedidosTable
              pedidos={pedidos}
              onView={handleOpenVisualizacao}
              onPrint={handleImprimir}
              onEdit={handleOpenEditForm}
              onClone={handleClonar}
              onDelete={handleOpenDeleteConfirm}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>

      <PedidoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        pedido={selectedPedido}
        isLoading={isSubmitting}
      />

      <PedidoVisualizacao
        open={visualizacaoOpen}
        onOpenChange={setVisualizacaoOpen}
        pedido={pedidoParaVisualizar}
      />

      <DeletePedidoDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        selectedPedido={selectedPedido}
        onDelete={handleDelete}
        isLoading={isActionLoading}
      />
    </div>
  );
}
