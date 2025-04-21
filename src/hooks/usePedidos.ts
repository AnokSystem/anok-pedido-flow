
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pedido, ItemPedido } from '@/types';
import { toast } from '@/hooks/use-toast';

export function usePedidos() {
  const queryClient = useQueryClient();

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['pedidos'],
    queryFn: async () => {
      // Primeiro, buscar os pedidos com informações do cliente
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select(`
          *,
          cliente:clientes(*)
        `)
        .order('data_emissao', { ascending: false });

      if (pedidosError) {
        toast({
          title: 'Erro ao carregar pedidos',
          description: pedidosError.message,
          variant: 'destructive',
        });
        throw pedidosError;
      }

      // Para cada pedido, buscar seus itens
      const pedidosCompletos = await Promise.all(
        pedidosData.map(async (pedido) => {
          const { data: itensData, error: itensError } = await supabase
            .from('itens_pedido')
            .select(`
              *,
              produto:produtos(*)
            `)
            .eq('pedido_id', pedido.id);

          if (itensError) {
            console.error('Erro ao carregar itens do pedido:', itensError);
            return {
              ...pedido,
              itens: [] as ItemPedido[]
            };
          }

          return {
            ...pedido,
            itens: itensData as ItemPedido[]
          };
        })
      );

      return pedidosCompletos as Pedido[];
    },
  });

  const createPedido = useMutation({
    mutationFn: async (pedido: Omit<Pedido, 'id' | 'itens'> & { itens: Omit<ItemPedido, 'id' | 'pedido_id'>[] }) => {
      // Criar o pedido primeiro
      const { data: novoPedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          numero_pedido: pedido.numero_pedido,
          cliente_id: pedido.cliente_id,
          empresa_id: pedido.empresa_id,
          data_emissao: pedido.data_emissao,
          data_entrega: pedido.data_entrega,
          total: pedido.total,
          status: pedido.status
        })
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // Adicionar os itens do pedido
      if (pedido.itens && pedido.itens.length > 0) {
        const itensComPedidoId = pedido.itens.map(item => ({
          ...item,
          pedido_id: novoPedido.id
        }));

        const { error: itensError } = await supabase
          .from('itens_pedido')
          .insert(itensComPedidoId);

        if (itensError) throw itensError;
      }

      return novoPedido;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast({
        title: 'Pedido criado',
        description: 'O pedido foi criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar pedido',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updatePedido = useMutation({
    mutationFn: async (pedido: Pedido) => {
      // Atualizar o pedido
      const { data: pedidoAtualizado, error: pedidoError } = await supabase
        .from('pedidos')
        .update({
          numero_pedido: pedido.numero_pedido,
          cliente_id: pedido.cliente_id,
          data_emissao: pedido.data_emissao,
          data_entrega: pedido.data_entrega,
          total: pedido.total,
          status: pedido.status
        })
        .eq('id', pedido.id)
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // Remover itens existentes e adicionar os novos
      if (pedido.itens) {
        // Primeiro remover todos os itens existentes
        const { error: deleteError } = await supabase
          .from('itens_pedido')
          .delete()
          .eq('pedido_id', pedido.id);

        if (deleteError) throw deleteError;

        // Adicionar os novos itens, se houver
        if (pedido.itens.length > 0) {
          const itensParaInserir = pedido.itens.map(item => ({
            ...item,
            id: undefined, // Remover ID para que novos sejam gerados
            pedido_id: pedido.id
          }));

          const { error: insertError } = await supabase
            .from('itens_pedido')
            .insert(itensParaInserir);

          if (insertError) throw insertError;
        }
      }

      return pedidoAtualizado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast({
        title: 'Pedido atualizado',
        description: 'O pedido foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar pedido',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    pedidos,
    isLoading,
    createPedido,
    updatePedido,
  };
}
