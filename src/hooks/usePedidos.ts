
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pedido, ItemPedido } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useClientes } from '@/hooks/useClientes';

export function usePedidos() {
  const queryClient = useQueryClient();
  const { clientes } = useClientes();

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

  const getPedidoById = async (id: string): Promise<Pedido | null> => {
    try {
      // Buscar o pedido com informações do cliente
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .select(`
          *,
          cliente:clientes(*)
        `)
        .eq('id', id)
        .single();

      if (pedidoError) {
        console.error('Erro ao carregar pedido:', pedidoError);
        return null;
      }

      // Buscar os itens do pedido
      const { data: itensData, error: itensError } = await supabase
        .from('itens_pedido')
        .select(`
          *,
          produto:produtos(*)
        `)
        .eq('pedido_id', id);

      if (itensError) {
        console.error('Erro ao carregar itens do pedido:', itensError);
        return {
          ...pedidoData,
          itens: []
        } as Pedido;
      }

      return {
        ...pedidoData,
        itens: itensData
      } as Pedido;
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return null;
    }
  };

  const createPedido = useMutation({
    mutationFn: async (pedido: Omit<Pedido, 'id' | 'itens'> & { itens: Omit<ItemPedido, 'id' | 'pedido_id'>[] }) => {
      console.log('Criando pedido:', pedido);
      
      // Buscar desconto do cliente, se houver
      const cliente = clientes?.find(c => c.id === pedido.cliente_id);
      const descontoCliente = cliente?.desconto_especial || 0;
      
      // Preparar dados para inserção
      const pedidoParaInserir = {
        numero_pedido: pedido.numero_pedido,
        cliente_id: pedido.cliente_id,
        data_emissao: typeof pedido.data_emissao === 'string' ? 
          pedido.data_emissao : new Date(pedido.data_emissao).toISOString(),
        data_entrega: pedido.data_entrega ? 
          (typeof pedido.data_entrega === 'string' ? 
            pedido.data_entrega : new Date(pedido.data_entrega).toISOString()) : null,
        total: Number(pedido.total) || 0,
        status: pedido.status,
        descricao: pedido.descricao || '',
      };
      
      try {
        // Criar o pedido primeiro
        const { data: novoPedido, error: pedidoError } = await supabase
          .from('pedidos')
          .insert(pedidoParaInserir)
          .select()
          .single();

        if (pedidoError) {
          console.error('Erro ao criar pedido:', pedidoError);
          throw pedidoError;
        }

        // Adicionar os itens do pedido
        if (pedido.itens && pedido.itens.length > 0) {
          const itensComPedidoId = pedido.itens.map(item => ({
            pedido_id: novoPedido.id,
            produto_id: item.produto_id,
            descricao: item.descricao,
            quantidade: Number(item.quantidade),
            unidade: item.unidade,
            valor_unit: Number(item.valor_unit),
            valor_total: Number(item.valor_total),
            largura: item.largura ? Number(item.largura) : null,
            altura: item.altura ? Number(item.altura) : null
          }));

          const { error: itensError } = await supabase
            .from('itens_pedido')
            .insert(itensComPedidoId);

          if (itensError) {
            console.error('Erro ao adicionar itens do pedido:', itensError);
            throw itensError;
          }
        }

        return novoPedido;
      } catch (error) {
        console.error('Erro ao criar pedido:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast({
        title: 'Pedido criado',
        description: 'O pedido foi criado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: 'Erro ao criar pedido',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updatePedido = useMutation({
    mutationFn: async (pedido: Pedido) => {
      console.log('Atualizando pedido:', pedido);
      
      // Buscar desconto do cliente, se houver
      const cliente = clientes?.find(c => c.id === pedido.cliente_id);
      const descontoCliente = cliente?.desconto_especial || 0;
      
      // Preparar dados para atualização
      const pedidoParaAtualizar = {
        numero_pedido: pedido.numero_pedido,
        cliente_id: pedido.cliente_id,
        data_emissao: typeof pedido.data_emissao === 'string' ? 
          pedido.data_emissao : new Date(pedido.data_emissao).toISOString(),
        data_entrega: pedido.data_entrega ? 
          (typeof pedido.data_entrega === 'string' ? 
            pedido.data_entrega : new Date(pedido.data_entrega).toISOString()) : null,
        total: Number(pedido.total) || 0,
        status: pedido.status,
        descricao: pedido.descricao || '',
      };
      
      try {
        // Atualizar o pedido
        const { data: pedidoAtualizado, error: pedidoError } = await supabase
          .from('pedidos')
          .update(pedidoParaAtualizar)
          .eq('id', pedido.id)
          .select()
          .single();

        if (pedidoError) {
          console.error('Erro ao atualizar pedido:', pedidoError);
          throw pedidoError;
        }

        // Remover itens existentes e adicionar os novos
        if (pedido.itens) {
          // Primeiro remover todos os itens existentes
          const { error: deleteError } = await supabase
            .from('itens_pedido')
            .delete()
            .eq('pedido_id', pedido.id);

          if (deleteError) {
            console.error('Erro ao remover itens existentes:', deleteError);
            throw deleteError;
          }

          // Adicionar os novos itens, se houver
          if (pedido.itens.length > 0) {
            const itensParaInserir = pedido.itens.map(item => ({
              pedido_id: pedido.id,
              produto_id: item.produto_id,
              descricao: item.descricao,
              quantidade: Number(item.quantidade),
              unidade: item.unidade,
              largura: item.largura ? Number(item.largura) : null,
              altura: item.altura ? Number(item.altura) : null,
              valor_unit: Number(item.valor_unit),
              valor_total: Number(item.valor_total)
            }));

            const { error: insertError } = await supabase
              .from('itens_pedido')
              .insert(itensParaInserir);

            if (insertError) {
              console.error('Erro ao inserir novos itens:', insertError);
              throw insertError;
            }
          }
        }

        return pedidoAtualizado;
      } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast({
        title: 'Pedido atualizado',
        description: 'O pedido foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar pedido:', error);
      toast({
        title: 'Erro ao atualizar pedido',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deletePedido = useMutation({
    mutationFn: async (id: string) => {
      try {
        // Primeiro remover todos os itens do pedido
        const { error: deleteItensError } = await supabase
          .from('itens_pedido')
          .delete()
          .eq('pedido_id', id);

        if (deleteItensError) {
          console.error('Erro ao remover itens do pedido:', deleteItensError);
          throw deleteItensError;
        }

        // Depois remover o pedido
        const { error: deletePedidoError } = await supabase
          .from('pedidos')
          .delete()
          .eq('id', id);

        if (deletePedidoError) {
          console.error('Erro ao remover pedido:', deletePedidoError);
          throw deletePedidoError;
        }

        return id;
      } catch (error) {
        console.error('Erro ao excluir pedido:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast({
        title: 'Pedido excluído',
        description: 'O pedido foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir pedido:', error);
      toast({
        title: 'Erro ao excluir pedido',
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
    deletePedido,
    getPedidoById,
  };
}
