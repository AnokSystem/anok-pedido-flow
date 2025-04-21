
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Produto } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useProdutos() {
  const queryClient = useQueryClient();

  const { data: produtos, isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');

      if (error) {
        toast({
          title: 'Erro ao carregar produtos',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as Produto[];
    },
  });

  const createProduto = useMutation({
    mutationFn: async (produto: Omit<Produto, 'id'>) => {
      console.log('Criando produto:', produto);
      const { data, error } = await supabase
        .from('produtos')
        .insert(produto)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast({
        title: 'Produto criado',
        description: 'O produto foi criado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao criar produto:', error);
      toast({
        title: 'Erro ao criar produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateProduto = useMutation({
    mutationFn: async (produto: Produto) => {
      console.log('Atualizando produto:', produto);
      const { data, error } = await supabase
        .from('produtos')
        .update(produto)
        .eq('id', produto.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast({
        title: 'Produto atualizado',
        description: 'O produto foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: 'Erro ao atualizar produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    produtos,
    isLoading,
    createProduto,
    updateProduto,
  };
}
