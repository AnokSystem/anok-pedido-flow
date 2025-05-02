
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
      // Garantir que unidade seja do tipo correto
      const unidadeValida = produto.unidade as 'un' | 'm²' | 'kg' | 'l' | 'caixa';
      
      const { data, error } = await supabase
        .from('produtos')
        .insert({
          ...produto,
          unidade: unidadeValida,
          empresa_id: null // Set to null instead of a placeholder UUID
        })
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
      // Garantir que unidade seja do tipo correto
      const unidadeValida = produto.unidade as 'un' | 'm²' | 'kg' | 'l' | 'caixa';
      
      const { data, error } = await supabase
        .from('produtos')
        .update({
          ...produto,
          unidade: unidadeValida
        })
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

  const deleteProduto = useMutation({
    mutationFn: async (id: string) => {
      console.log('Excluindo produto:', id);
      
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast({
        title: 'Produto excluído',
        description: 'O produto foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: 'Erro ao excluir produto',
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
    deleteProduto
  };
}
