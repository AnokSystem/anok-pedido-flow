
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pedido, Cliente, ItemPedido } from '@/types';
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

  const getPedidoById = async (id: string) => {
    console.log('Buscando pedido detalhado:', id);
    
    try {
      // Buscar pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .select(`
          *,
          cliente:clientes(*)
        `)
        .eq('id', id)
        .single();

      if (pedidoError) throw pedidoError;
      
      // Buscar itens do pedido
      const { data: itens, error: itensError } = await supabase
        .from('itens_pedido')
        .select(`
          *,
          produto:produtos(*)
        `)
        .eq('pedido_id', id)
        .order('id');

      if (itensError) throw itensError;
      
      // Combinar pedido com itens
      return { ...pedido, itens: itens || [] } as Pedido;
    } catch (error) {
      console.error('Erro ao buscar pedido por ID:', error);
      throw error;
    }
  };

  // Função para enviar webhook
  const sendWebhook = async (pedido: Pedido) => {
    try {
      // Buscar configuração de webhook
      const { data: webhookConfig, error: webhookError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('ativado', true)
        .maybeSingle();
      
      if (webhookError) {
        console.error('Erro ao buscar configuração de webhook:', webhookError);
        return;
      }
      
      // Se não houver webhook configurado ou não estiver ativo, retornar
      if (!webhookConfig || !webhookConfig.ativado) {
        console.log('Nenhum webhook ativo configurado');
        return;
      }
      
      console.log('Configuração de webhook encontrada:', webhookConfig);
      
      // Preparar dados para enviar baseado nos campos selecionados
      const webhookData: Record<string, any> = {
        evento: 'pedido_atualizado',
        timestamp: new Date().toISOString()
      };
      
      // Adicionar campos com base na configuração
      const camposSelecionados = webhookConfig.campos_selecionados || [];
      
      if (camposSelecionados.includes('numero_pedido')) {
        webhookData.numero_pedido = pedido.numero_pedido;
      }
      
      if (camposSelecionados.includes('cliente') && pedido.cliente) {
        webhookData.cliente = {
          nome: pedido.cliente.nome,
          cpf_cnpj: pedido.cliente.cpf_cnpj,
          email: pedido.cliente.email,
          contato: pedido.cliente.contato
        };
      }
      
      if (camposSelecionados.includes('itens') && pedido.itens) {
        webhookData.itens = pedido.itens.map(item => ({
          descricao: item.descricao,
          quantidade: item.quantidade,
          unidade: item.unidade,
          valor_unit: item.valor_unit,
          valor_total: item.valor_total
        }));
      }
      
      if (camposSelecionados.includes('valor')) {
        webhookData.valor_total = pedido.total;
      }
      
      if (camposSelecionados.includes('pdf')) {
        // Simulação de URL do PDF - em uma implementação real, seria gerado dinamicamente
        webhookData.pdf_url = `https://seu-dominio.com/pedidos/${pedido.numero_pedido}.pdf`;
      }
      
      console.log('Enviando dados para webhook:', webhookConfig.url_destino);
      console.log('Dados:', webhookData);
      
      // Enviar dados para o webhook configurado
      const response = await fetch(webhookConfig.url_destino, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
        // Using no-cors to avoid CORS issues with external services
        mode: 'no-cors'
      });
      
      console.log('Webhook enviado com sucesso');
      
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      // Não falhar a operação principal se o webhook falhar
    }
  };

  const createPedido = useMutation({
    mutationFn: async (novoPedido: Omit<Pedido, 'id'>) => {
      console.log('Criando pedido:', novoPedido);

      // 1. Criar pedido
      const { data: pedidoCriado, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          numero_pedido: novoPedido.numero_pedido,
          cliente_id: novoPedido.cliente_id,
          data_emissao: novoPedido.data_emissao,
          data_entrega: novoPedido.data_entrega,
          total: novoPedido.total,
          status: novoPedido.status,
          descricao: novoPedido.descricao,
          empresa_id: novoPedido.empresa_id || null
        })
        .select()
        .single();

      if (pedidoError) throw pedidoError;
      
      const pedidoId = pedidoCriado.id;
      
      // 2. Criar itens do pedido
      if (novoPedido.itens && novoPedido.itens.length > 0) {
        const itensParaInserir = novoPedido.itens.map(item => ({
          pedido_id: pedidoId,
          produto_id: item.produto_id,
          descricao: item.descricao,
          quantidade: item.quantidade,
          largura: item.largura,
          altura: item.altura,
          unidade: item.unidade,
          valor_unit: item.valor_unit,
          valor_total: item.valor_total
        }));
        
        const { error: itensError } = await supabase
          .from('itens_pedido')
          .insert(itensParaInserir);
          
        if (itensError) throw itensError;
      }
      
      // 3. Buscar pedido completo
      const pedidoCompleto = await getPedidoById(pedidoId);
      
      // 4. Enviar webhook
      await sendWebhook(pedidoCompleto);
      
      return pedidoCompleto;
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
      
      // 1. Atualizar pedido
      const { error: pedidoError } = await supabase
        .from('pedidos')
        .update({
          numero_pedido: pedido.numero_pedido,
          cliente_id: pedido.cliente_id,
          data_emissao: pedido.data_emissao,
          data_entrega: pedido.data_entrega,
          total: pedido.total,
          status: pedido.status,
          descricao: pedido.descricao
        })
        .eq('id', pedido.id);
        
      if (pedidoError) throw pedidoError;
      
      // 2. Excluir itens existentes
      const { error: deleteError } = await supabase
        .from('itens_pedido')
        .delete()
        .eq('pedido_id', pedido.id);
        
      if (deleteError) throw deleteError;
      
      // 3. Inserir novos itens
      if (pedido.itens && pedido.itens.length > 0) {
        const itensParaInserir = pedido.itens.map(item => ({
          pedido_id: pedido.id,
          produto_id: item.produto_id,
          descricao: item.descricao,
          quantidade: item.quantidade,
          largura: item.largura,
          altura: item.altura,
          unidade: item.unidade,
          valor_unit: item.valor_unit,
          valor_total: item.valor_total
        }));
        
        const { error: itensError } = await supabase
          .from('itens_pedido')
          .insert(itensParaInserir);
          
        if (itensError) throw itensError;
      }
      
      // 4. Buscar pedido atualizado
      const pedidoAtualizado = await getPedidoById(pedido.id);
      
      // 5. Enviar webhook
      await sendWebhook(pedidoAtualizado);
      
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
      // 1. Buscar pedido antes de excluir para enviar webhook
      const pedido = await getPedidoById(id);
      
      // 2. Excluir itens do pedido
      const { error: itensError } = await supabase
        .from('itens_pedido')
        .delete()
        .eq('pedido_id', id);
        
      if (itensError) throw itensError;
      
      // 3. Excluir pedido
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return pedido;
    },
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast({
        title: 'Pedido excluído',
        description: 'O pedido foi excluído com sucesso.',
      });
      
      // Enviar webhook com evento de exclusão
      try {
        // Modificar o pedido para indicar que foi excluído
        const pedidoExcluido = {
          ...pedido,
          evento: 'pedido_excluido'
        };
        sendWebhook(pedidoExcluido as Pedido);
      } catch (error) {
        console.error('Erro ao enviar webhook de exclusão:', error);
      }
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
    getPedidoById,
    createPedido,
    updatePedido,
    deletePedido
  };
}
