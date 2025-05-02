
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pedido, ItemPedido } from "@/types";
import { useClientes } from "@/hooks/useClientes";
import { calcularTotalPedido } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const pedidoSchema = z.object({
  numero_pedido: z.string().min(1, "O número do pedido é obrigatório"),
  cliente_id: z.string().min(1, "Selecione um cliente"),
  data_emissao: z.date(),
  data_entrega: z.date().optional(),
  status: z.string().min(1, "Selecione um status"),
});

type PedidoFormData = z.infer<typeof pedidoSchema>;

export function usePedidoForm(pedido?: Pedido, open?: boolean, onOpenChange?: (open: boolean) => void) {
  const { clientes } = useClientes();
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [largura, setLargura] = useState<number | undefined>(0.5);
  const [altura, setAltura] = useState<number | undefined>(0.5);
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
    },
  });

  // Carrega os itens do pedido quando estiver em modo de edição
  useEffect(() => {
    if (open && editMode && pedido?.itens) {
      setItensPedido(pedido.itens);
      setClienteSelecionado(pedido.cliente_id);
      calcularTotal(pedido.itens, getClienteDesconto(pedido.cliente_id));
    } else if (open && !editMode) {
      setItensPedido([]);
      setClienteSelecionado("");
      setTotal(0);
      setDescontoCliente(0);
      setLargura(0.5);
      setAltura(0.5);
    }
  }, [open, editMode, pedido]);

  // Função para obter o desconto do cliente
  const getClienteDesconto = (clienteId: string): number => {
    const cliente = clientes?.find(c => c.id === clienteId);
    return cliente?.desconto_especial || 0;
  };

  // Lidar com a mudança de cliente
  const handleClienteChange = (clienteId: string) => {
    setClienteSelecionado(clienteId);
    const desconto = getClienteDesconto(clienteId);
    setDescontoCliente(desconto);
    // Recalcular o total com o novo desconto
    calcularTotal(itensPedido, desconto);
  };

  // Calcular o total do pedido
  const calcularTotal = (itens: ItemPedido[], descontoPercentual: number = 0) => {
    const novoTotal = calcularTotalPedido(itens, descontoPercentual);
    setTotal(novoTotal);
  };

  // Lidar com a mudança de produto
  const handleProdutoChange = (produtoId: string) => {
    setProdutoSelecionado(produtoId);
  };

  // Validação antes do envio
  const validateSubmit = () => {
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
    clienteSelecionado,
    editMode,
    descricao, 
    setDescricao,
    handleClienteChange,
    handleProdutoChange,
    calcularTotal,
    validateSubmit
  };
}
