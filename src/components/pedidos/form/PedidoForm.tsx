import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Pedido, ItemPedido } from "@/types";
import { useClientes } from "@/hooks/useClientes";
import { usePedidos } from "@/hooks/usePedidos";
import { useProdutos } from "@/hooks/useProdutos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { calcularValorItem, calcularTotalPedido, gerarNumeroSequencial } from "@/lib/utils";
import { PedidoHeaderForm } from "./PedidoHeaderForm";
import { PedidoItemForm } from "./PedidoItemForm";
import { PedidoItensTable } from "./PedidoItensTable";

const pedidoSchema = z.object({
  numero_pedido: z.string().min(1, "O número do pedido é obrigatório"),
  cliente_id: z.string().min(1, "Selecione um cliente"),
  data_emissao: z.date(),
  data_entrega: z.date().optional(),
  status: z.string().min(1, "Selecione um status"),
  descricao: z.string().optional(),
});

interface PedidoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  pedido?: Pedido;
  isLoading: boolean;
}

export function PedidoForm({ open, onOpenChange, onSubmit, pedido, isLoading }: PedidoFormProps) {
  const { clientes, isLoading: clientesLoading } = useClientes();
  const { produtos, isLoading: produtosLoading } = useProdutos();
  const { pedidos } = usePedidos();
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [largura, setLargura] = useState<number | undefined>(undefined);
  const [altura, setAltura] = useState<number | undefined>(undefined);
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

  useEffect(() => {
    if (open && !editMode) {
      const proximoNumero = (pedidos?.length || 0) + 1;
      const novoNumeroPedido = gerarNumeroSequencial("PED", proximoNumero);
      form.setValue("numero_pedido", novoNumeroPedido);
    }
  }, [open, editMode, pedidos, form]);

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

  const getClienteDesconto = (clienteId: string): number => {
    const cliente = clientes?.find(c => c.id === clienteId);
    return cliente?.desconto_especial || 0;
  };

  const handleClienteChange = (clienteId: string) => {
    setClienteSelecionado(clienteId);
    const desconto = getClienteDesconto(clienteId);
    setDescontoCliente(desconto);
    calcularTotal(itensPedido, desconto);
  };

  const handleProdutoChange = (produtoId: string) => {
    setProdutoSelecionado(produtoId);
    const produto = produtos?.find(p => p.id === produtoId);
    if (produto) {
      setUnidade(produto.unidade);
    }
  };

  const adicionarItem = () => {
    if (!produtoSelecionado || quantidade <= 0) {
      toast({
        title: "Erro ao adicionar item",
        description: "Selecione um produto e informe a quantidade",
        variant: "destructive",
      });
      return;
    }

    const produtoEncontrado = produtos?.find(p => p.id === produtoSelecionado);
    
    if (!produtoEncontrado) {
      toast({
        title: "Erro ao adicionar item",
        description: "Produto não encontrado",
        variant: "destructive",
      });
      return;
    }

    const valorUnitario = produtoEncontrado.preco_unitario;
    const valorTotal = calcularValorItem(
      quantidade, 
      valorUnitario, 
      unidade, 
      largura, 
      altura
    );

    const novoItem: ItemPedido = {
      id: `temp-${Date.now()}`,
      pedido_id: pedido?.id || "",
      produto_id: produtoEncontrado.id,
      descricao: descricao || produtoEncontrado.nome,
      quantidade: quantidade,
      unidade: produtoEncontrado.unidade,
      valor_unit: valorUnitario,
      valor_total: valorTotal,
      largura: largura,
      altura: altura,
      produto: produtoEncontrado
    };

    const novosItens = [...itensPedido, novoItem];
    setItensPedido(novosItens);
    calcularTotal(novosItens, descontoCliente);
    
    setProdutoSelecionado("");
    setQuantidade(1);
    setLargura(undefined);
    setAltura(undefined);
    setUnidade("un");
    setDescricao("");
  };

  const removerItem = (index: number) => {
    const novosItens = [...itensPedido];
    novosItens.splice(index, 1);
    setItensPedido(novosItens);
    calcularTotal(novosItens, descontoCliente);
  };

  const calcularTotal = (itens: ItemPedido[], descontoPercentual: number = 0) => {
    const novoTotal = calcularTotalPedido(itens, descontoPercentual);
    setTotal(novoTotal);
  };

  const handleSubmit = (data: z.infer<typeof pedidoSchema>) => {
    if (itensPedido.length === 0) {
      toast({
        title: "Atenção",
        description: "Adicione pelo menos um item ao pedido",
        variant: "destructive",
      });
      return;
    }

    const dadosCompletos = {
      ...data,
      itens: itensPedido,
      total: total
    };
    
    onSubmit(dadosCompletos);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editMode ? "Editar Pedido" : "Novo Pedido"}</DialogTitle>
          <DialogDescription>
            {editMode ? "Atualize as informações do pedido" : "Preencha as informações para criar um novo pedido"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <PedidoHeaderForm 
              form={form}
              editMode={editMode}
              clientesLoading={clientesLoading}
              clientes={clientes}
              handleClienteChange={handleClienteChange}
              descontoCliente={descontoCliente}
            />

            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <PedidoItemForm
                    produtosLoading={produtosLoading}
                    produtos={produtos}
                    produtoSelecionado={produtoSelecionado}
                    quantidade={quantidade}
                    largura={largura}
                    altura={altura}
                    unidade={unidade}
                    descricao={descricao}
                    handleProdutoChange={handleProdutoChange}
                    setQuantidade={setQuantidade}
                    setLargura={setLargura}
                    setAltura={setAltura}
                    setDescricao={setDescricao}
                    adicionarItem={adicionarItem}
                  />

                  <PedidoItensTable
                    itensPedido={itensPedido}
                    unidade={unidade}
                    removerItem={removerItem}
                    descontoCliente={descontoCliente}
                    total={total}
                  />
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : editMode ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
