
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pedido } from '@/types';
import { toast } from '@/hooks/use-toast';

export function usePedidos() {
  const queryClient = useQueryClient();

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['pedidos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          cliente:clientes(*)
        `)
        .order('data_emissao', { ascending: false });

      if (error) {
        toast({
          title: 'Erro ao carregar pedidos',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as Pedido[];
    },
  });

  const createPedido = useMutation({
    mutationFn: async (pedido: Omit<Pedido, 'id'>) => {
      const { data, error } = await supabase
        .from('pedidos')
        .insert(pedido)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('pedidos')
        .update(pedido)
        .eq('id', pedido.id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
