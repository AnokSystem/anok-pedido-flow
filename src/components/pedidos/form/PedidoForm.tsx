
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pedido } from "@/types";
import { useProdutos } from "@/hooks/useProdutos";
import { calcularValorItem } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { PedidoHeaderForm } from "./PedidoHeaderForm";
import { PedidoItemForm } from "./PedidoItemForm";
import { PedidoItensTable } from "./PedidoItensTable";
import { PedidoDialogFooter } from "./PedidoDialogFooter";
import { usePedidoForm } from "./usePedidoForm";

interface PedidoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  pedido?: Pedido;
  isLoading: boolean;
}

export function PedidoForm({ open, onOpenChange, onSubmit, pedido, isLoading }: PedidoFormProps) {
  const { produtos, isLoading: produtosLoading } = useProdutos();
  const { 
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
    validateSubmit 
  } = usePedidoForm(pedido, open, onOpenChange);

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

    const descricaoFinal = descricao || produtoEncontrado.nome;

    const novoItem = {
      id: `temp-${Date.now()}`,
      pedido_id: pedido?.id || "",
      produto_id: produtoEncontrado.id,
      descricao: descricaoFinal,
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
    
    // Reset fields after adding an item
    setProdutoSelecionado("");
    setQuantidade(1);
    setLargura(0.5);
    setAltura(0.5);
    setUnidade("un");
    setDescricao("");
  };

  const removerItem = (index: number) => {
    const novosItens = [...itensPedido];
    novosItens.splice(index, 1);
    setItensPedido(novosItens);
    calcularTotal(novosItens, descontoCliente);
  };

  const handleSubmit = (data: any) => {
    if (!validateSubmit()) return;

    const dadosCompletos = {
      ...data,
      itens: itensPedido,
      total: total
    };
    
    onSubmit(dadosCompletos);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95vh] overflow-y-auto">
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

            <PedidoDialogFooter
              onCancel={() => onOpenChange(false)}
              isLoading={isLoading}
              editMode={editMode}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
