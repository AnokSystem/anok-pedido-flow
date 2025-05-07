
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useClientes() {
  const queryClient = useQueryClient();

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');

      if (error) {
        toast({
          title: 'Erro ao carregar clientes',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as Cliente[];
    },
  });

  const createCliente = useMutation({
    mutationFn: async (cliente: Omit<Cliente, 'id'>) => {
      const { data, error } = await supabase
        .from('clientes')
        .insert(cliente)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: 'Cliente criado',
        description: 'O cliente foi criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateCliente = useMutation({
    mutationFn: async (cliente: Cliente) => {
      console.log("Atualizando cliente:", cliente);
      const { data, error } = await supabase
        .from('clientes')
        .update({
          nome: cliente.nome,
          cpf_cnpj: cliente.cpf_cnpj,
          rua: cliente.rua,
          numero: cliente.numero,
          bairro: cliente.bairro,
          cidade: cliente.cidade,
          contato: cliente.contato,
          email: cliente.email,
          responsavel: cliente.responsavel,
          desconto_especial: cliente.desconto_especial
        })
        .eq('id', cliente.id)
        .select()
        .single();

      if (error) {
        console.error("Erro na atualização:", error);
        throw error;
      }
      console.log("Cliente atualizado com sucesso:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: 'Cliente atualizado',
        description: 'O cliente foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      console.error("Erro na mutação:", error);
      toast({
        title: 'Erro ao atualizar cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCliente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: 'Cliente excluído',
        description: 'O cliente foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const importClientes = useMutation({
    mutationFn: async (clientes: Omit<Cliente, 'id'>[]) => {
      if (!clientes.length) {
        throw new Error('Nenhum cliente para importar');
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert(clientes)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: 'Clientes importados',
        description: `${data.length} clientes foram importados com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao importar clientes',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    clientes,
    isLoading,
    createCliente,
    updateCliente,
    deleteCliente,
    importClientes,
  };
}
