
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pedido, ItemPedido } from "@/types";
import { toast } from "@/hooks/use-toast";
import { usePedidos } from "@/hooks/usePedidos";
import { gerarNumeroSequencial, calcularTotalPedido } from "@/lib/utils";

const pedidoSchema = z.object({
  numero_pedido: z.string().min(1, "O número do pedido é obrigatório"),
  cliente_id: z.string().min(1, "Selecione um cliente"),
  data_emissao: z.date(),
  data_entrega: z.date().optional(),
  status: z.string().min(1, "Selecione um status"),
  descricao: z.string().optional(),
});

type PedidoFormData = z.infer<typeof pedidoSchema>;

export function usePedidoFormState(pedido?: Pedido, open: boolean, onOpenChange: (open: boolean) => void) {
  const { pedidos } = usePedidos();
  const [numeroPedidoGerado, setNumeroPedidoGerado] = useState("");
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [largura, setLargura] = useState<number>(0.5);
  const [altura, setAltura] = useState<number>(0.5);
  const [unidade, setUnidade] = useState<string>("un");
  const [total, setTotal] = useState<number>(0);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
  const [descontoCliente, setDescontoCliente] = useState<number>(0);
  const [descricao, setDescricao] = useState<string>("");
  
  const editMode = !!pedido;
  
  const form = useForm<PedidoFormData>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      numero_pedido: pedido?.numero_pedido || "",
      cliente_id: pedido?.cliente_id || "",
      data_emissao: pedido?.data_emissao ? new Date(pedido.data_emissao) : new Date(),
      data_entrega: pedido?.data_entrega ? new Date(pedido.data_entrega) : undefined,
      status: pedido?.status || "Criado",
      descricao: pedido?.descricao || "",
    },
  });
  
  // Gera um número de pedido automático quando abrir o form para novo pedido
  useEffect(() => {
    if (open && !editMode) {
      // Conta quantos pedidos já existem e adiciona 1
      const proximoNumero = (pedidos?.length || 0) + 1;
      const novoNumeroPedido = gerarNumeroSequencial("PED", proximoNumero);
      setNumeroPedidoGerado(novoNumeroPedido);
    }
  }, [open, editMode, pedidos]);

  // Carrega os itens do pedido quando estiver em modo de edição
  useEffect(() => {
    if (open) {
      if (editMode && pedido?.itens) {
        setItensPedido(pedido.itens);
        setClienteSelecionado(pedido.cliente_id);
        calcularTotal(pedido.itens, getClienteDesconto(pedido.cliente_id));
      } else {
        setItensPedido([]);
        setClienteSelecionado("");
        setTotal(0);
        setDescontoCliente(0);
        setDescricao("");
      }
    }
  }, [open, editMode, pedido]);
  
  // Reset form values when pedido changes
  useEffect(() => {
    if (open) {
      if (editMode && pedido) {
        form.reset({
          numero_pedido: pedido.numero_pedido,
          cliente_id: pedido.cliente_id,
          data_emissao: pedido.data_emissao ? new Date(pedido.data_emissao) : new Date(),
          data_entrega: pedido.data_entrega ? new Date(pedido.data_entrega) : undefined,
          status: pedido.status,
          descricao: pedido.descricao,
        });
        setClienteSelecionado(pedido.cliente_id);
      } else {
        form.reset({
          numero_pedido: numeroPedidoGerado,
          cliente_id: "",
          data_emissao: new Date(),
          data_entrega: undefined,
          status: "Criado",
          descricao: "",
        });
        setClienteSelecionado("");
      }
    }
  }, [open, editMode, pedido, form, numeroPedidoGerado]);

  // Atualiza o valor do formulário quando o número do pedido é gerado
  useEffect(() => {
    if (numeroPedidoGerado && !editMode && open) {
      form.setValue("numero_pedido", numeroPedidoGerado);
    }
  }, [numeroPedidoGerado, form, editMode, open]);

  // Função para obter o desconto do cliente
  const getClienteDesconto = (clienteId: string): number => {
    // This function would typically fetch the client discount from a client service
    // For now we'll return 0 as this is just a placeholder for the refactoring
    return 0;
  };

  // Lidar com a mudança de cliente
  const handleClienteChange = (clienteId: string) => {
    setClienteSelecionado(clienteId);
    const desconto = getClienteDesconto(clienteId);
    setDescontoCliente(desconto);
    // Recalcular o total com o novo desconto
    calcularTotal(itensPedido, desconto);
  };

  // Lidar com a mudança de produto
  const handleProdutoChange = (produtoId: string) => {
    setProdutoSelecionado(produtoId);
    // Here you would typically set the unit based on the selected product
    // For simplicity, we'll just set a default unit
    setUnidade("un");
  };

  // Calcular o total do pedido
  const calcularTotal = (itens: ItemPedido[], descontoPercentual: number = 0) => {
    const novoTotal = calcularTotalPedido(itens, descontoPercentual);
    setTotal(novoTotal);
  };

  // Validate form before submit
  const validateSubmit = (): boolean => {
    if (itensPedido.length === 0) {
      toast({
        title: "Atenção",
        description: "Adicione pelo menos um item ao pedido",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return {
    form,
    itensPedido,
    setItensPedido,
    produtoSelecionado,
    setProdutoSelecionado,
    quantidade,
    setQuantidade,
    largura,
    setLargura,
    altura,
    setAltura,
    unidade,
    setUnidade,
    total,
    descontoCliente,
    editMode,
    descricao,
    setDescricao,
    handleClienteChange,
    handleProdutoChange,
    calcularTotal,
    validateSubmit,
    clienteSelecionado,
    setClienteSelecionado
  };
}
