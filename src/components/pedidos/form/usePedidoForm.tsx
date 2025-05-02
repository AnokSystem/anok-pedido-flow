
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pedido, ItemPedido } from "@/types";
import { usePedidos } from "@/hooks/usePedidos";
import { useClientes } from "@/hooks/useClientes";
import { useProdutos } from "@/hooks/useProdutos";
import { calcularTotalPedido, gerarNumeroSequencial } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// Schema definition for the form validation
const pedidoSchema = z.object({
  numero_pedido: z.string().min(1, "O número do pedido é obrigatório"),
  cliente_id: z.string().min(1, "Selecione um cliente"),
  data_emissao: z.date(),
  data_entrega: z.date().optional(),
  status: z.string().min(1, "Selecione um status"),
  descricao: z.string().optional(),
});

export function usePedidoForm(pedido?: Pedido, open: boolean, onOpenChange: (open: boolean) => void) {
  const { pedidos } = usePedidos();
  const { clientes } = useClientes();
  const { produtos } = useProdutos();
  
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
  
  const form = useForm<z.infer<typeof pedidoSchema>>({
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

  // Generate a new sequential order number when opening the form in creation mode
  useEffect(() => {
    if (open && !editMode) {
      const proximoNumero = (pedidos?.length || 0) + 1;
      const novoNumeroPedido = gerarNumeroSequencial("PED", proximoNumero);
      form.setValue("numero_pedido", novoNumeroPedido);
    }
  }, [open, editMode, pedidos, form]);

  // Load order items when in edit mode
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
    }
  }, [open, editMode, pedido]);

  // Function to get client discount
  const getClienteDesconto = (clienteId: string): number => {
    const cliente = clientes?.find(c => c.id === clienteId);
    return cliente?.desconto_especial || 0;
  };

  // Handle client change
  const handleClienteChange = (clienteId: string) => {
    setClienteSelecionado(clienteId);
    const desconto = getClienteDesconto(clienteId);
    setDescontoCliente(desconto);
    calcularTotal(itensPedido, desconto);
  };

  // Handle product change
  const handleProdutoChange = (produtoId: string) => {
    setProdutoSelecionado(produtoId);
    const produto = produtos?.find(p => p.id === produtoId);
    if (produto) {
      setUnidade(produto.unidade);
      // Set default values for width and height when the unit is 'm²'
      if (produto.unidade === 'm²') {
        setLargura(0.5);
        setAltura(0.5);
      }
    }
  };

  // Calculate total
  const calcularTotal = (itens: ItemPedido[], descontoPercentual: number = 0) => {
    const novoTotal = calcularTotalPedido(itens, descontoPercentual);
    setTotal(novoTotal);
  };

  // Submit validation function
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
    setTotal,
    clienteSelecionado,
    setClienteSelecionado,
    descontoCliente,
    editMode,
    descricao,
    setDescricao,
    handleClienteChange,
    handleProdutoChange,
    calcularTotal,
    validateSubmit,
    pedidoSchema,
  };
}
