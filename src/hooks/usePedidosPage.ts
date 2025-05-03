
import { useState } from "react";
import { usePedidos } from "@/hooks/usePedidos";
import { Pedido } from "@/types";
import { toast } from "@/hooks/use-toast";

export function usePedidosPage() {
  const { pedidos, isLoading, createPedido, updatePedido, deletePedido, getPedidoById } = usePedidos();
  
  const [formOpen, setFormOpen] = useState(false);
  const [visualizacaoOpen, setVisualizacaoOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | undefined>(undefined);
  const [pedidoParaVisualizar, setPedidoParaVisualizar] = useState<Pedido | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleOpenNewForm = () => {
    setSelectedPedido(undefined);
    setFormOpen(true);
  };

  const handleOpenEditForm = async (pedido: Pedido) => {
    try {
      setIsActionLoading(true);
      // Buscar detalhes atualizados do pedido para edição
      const pedidoDetalhado = await getPedidoById(pedido.id);
      if (pedidoDetalhado) {
        setSelectedPedido(pedidoDetalhado);
        setFormOpen(true);
      } else {
        toast({
          title: "Erro ao carregar pedido",
          description: "Não foi possível carregar os detalhes do pedido para edição",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar pedido para edição:", error);
      toast({
        title: "Erro ao carregar pedido",
        description: "Não foi possível carregar os detalhes do pedido para edição",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenVisualizacao = async (pedido: Pedido) => {
    try {
      setIsActionLoading(true);
      // Buscar detalhes atualizados do pedido
      const pedidoDetalhado = await getPedidoById(pedido.id);
      if (pedidoDetalhado) {
        setPedidoParaVisualizar(pedidoDetalhado);
        setVisualizacaoOpen(true);
      } else {
        toast({
          title: "Erro ao carregar pedido",
          description: "Não foi possível carregar os detalhes do pedido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar pedido para visualização:", error);
      toast({
        title: "Erro ao carregar pedido",
        description: "Não foi possível carregar os detalhes do pedido",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenDeleteConfirm = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setConfirmDeleteOpen(true);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      if (selectedPedido) {
        // Editar pedido existente
        const pedidoAtualizado = {
          ...selectedPedido,
          ...data,
        };
        
        console.log('Enviando pedido para atualização:', pedidoAtualizado);
        await updatePedido.mutateAsync(pedidoAtualizado);
      } else {
        // Adicionar novo pedido
        const novoPedido = {
          ...data,
          total: data.total || 0, // Usar o valor total calculado
          itens: data.itens || [] // Usar os itens adicionados
        };
        
        console.log('Enviando pedido para criação:', novoPedido);
        await createPedido.mutateAsync(novoPedido);
      }
      setFormOpen(false);
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o pedido: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImprimir = async (pedido: Pedido) => {
    try {
      // Buscar detalhes atualizados do pedido
      const pedidoDetalhado = await getPedidoById(pedido.id);
      if (pedidoDetalhado) {
        setPedidoParaVisualizar(pedidoDetalhado);
        // Abrir visualização e imprimir após o componente ser montado
        setVisualizacaoOpen(true);
        setTimeout(() => {
          window.print();
        }, 500);
      } else {
        toast({
          title: "Erro ao carregar pedido",
          description: "Não foi possível carregar os detalhes do pedido para impressão",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao imprimir",
        description: "Ocorreu um erro ao preparar o pedido para impressão",
        variant: "destructive",
      });
    }
  };

  const handleClonar = async (pedido: Pedido) => {
    try {
      setIsActionLoading(true);
      // Buscar detalhes atualizados do pedido para clonar
      const pedidoDetalhado = await getPedidoById(pedido.id);
      if (pedidoDetalhado) {
        // Cria um novo objeto de pedido baseado no original, mas sem ID e com novo número
        const proximoNumero = (pedidos?.length || 0) + 1;
        const novoNumeroPedido = `PED-${String(proximoNumero).padStart(4, '0')}`;
        
        const pedidoClonado = {
          ...pedidoDetalhado,
          id: undefined,
          numero_pedido: novoNumeroPedido,
          data_emissao: new Date(),
          status: 'Criado',
          itens: pedidoDetalhado.itens.map(item => ({
            ...item,
            id: undefined,
            pedido_id: undefined
          }))
        };
        
        setSelectedPedido(pedidoClonado as any);
        setFormOpen(true);
      } else {
        toast({
          title: "Erro ao clonar pedido",
          description: "Não foi possível carregar os detalhes do pedido para clonagem",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao clonar pedido:", error);
      toast({
        title: "Erro ao clonar pedido",
        description: "Não foi possível clonar o pedido",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedPedido?.id) {
      try {
        setIsActionLoading(true);
        await deletePedido.mutateAsync(selectedPedido.id);
        setConfirmDeleteOpen(false);
      } catch (error) {
        console.error("Erro ao excluir pedido:", error);
        toast({
          title: "Erro ao excluir pedido",
          description: "Não foi possível excluir o pedido",
          variant: "destructive",
        });
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  return {
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
  };
}
