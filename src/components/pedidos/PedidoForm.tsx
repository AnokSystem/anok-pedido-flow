
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pedido, ItemPedido, Produto } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientes } from "@/hooks/useClientes";
import { format } from "date-fns";
import { CalendarIcon, Trash, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, calcularValorItem, calcularTotalPedido, formatarCurrency } from "@/lib/utils";
import { usePedidos } from "@/hooks/usePedidos";
import { gerarNumeroSequencial } from "@/lib/utils";
import { useProdutos } from "@/hooks/useProdutos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

const statusOptions = ["Criado", "Em Produção", "Pronto", "Entregue"];

const pedidoSchema = z.object({
  numero_pedido: z.string().min(1, "O número do pedido é obrigatório"),
  cliente_id: z.string().min(1, "Selecione um cliente"),
  data_emissao: z.date(),
  data_entrega: z.date().optional(),
  status: z.string().min(1, "Selecione um status"),
});

type PedidoFormData = z.infer<typeof pedidoSchema>;

interface PedidoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PedidoFormData & { itens: ItemPedido[] }) => void;
  pedido?: Pedido;
  isLoading: boolean;
}

export function PedidoForm({ open, onOpenChange, onSubmit, pedido, isLoading }: PedidoFormProps) {
  const { clientes, isLoading: clientesLoading } = useClientes();
  const { produtos, isLoading: produtosLoading } = useProdutos();
  const { pedidos } = usePedidos();
  const [numeroPedidoGerado, setNumeroPedidoGerado] = useState("");
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [largura, setLargura] = useState<number | undefined>(undefined);
  const [altura, setAltura] = useState<number | undefined>(undefined);
  const [unidade, setUnidade] = useState<string>("un");
  const [total, setTotal] = useState<number>(0);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
  const [descontoCliente, setDescontoCliente] = useState<number>(0);
  
  const editMode = !!pedido;
  
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

  // Reset form values when pedido changes
  useEffect(() => {
    if (open) {
      if (editMode && pedido) {
        // In edit mode, load existing pedido data
        form.reset({
          numero_pedido: pedido.numero_pedido,
          cliente_id: pedido.cliente_id,
          data_emissao: pedido.data_emissao ? new Date(pedido.data_emissao) : new Date(),
          data_entrega: pedido.data_entrega ? new Date(pedido.data_entrega) : undefined,
          status: pedido.status,
        });
        setClienteSelecionado(pedido.cliente_id);
      } else {
        // In creation mode, reset to defaults with generated number
        form.reset({
          numero_pedido: numeroPedidoGerado,
          cliente_id: "",
          data_emissao: new Date(),
          data_entrega: undefined,
          status: "Criado",
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

  // Adicionar um novo item ao pedido
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
      id: `temp-${Date.now()}`, // ID temporário
      pedido_id: pedido?.id || "",
      produto_id: produtoEncontrado.id,
      descricao: produtoEncontrado.descricao || produtoEncontrado.nome,
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
    
    // Limpar campos após adicionar
    setProdutoSelecionado("");
    setQuantidade(1);
    setLargura(undefined);
    setAltura(undefined);
    setUnidade("un");
  };

  // Remover item do pedido
  const removerItem = (index: number) => {
    const novosItens = [...itensPedido];
    novosItens.splice(index, 1);
    setItensPedido(novosItens);
    calcularTotal(novosItens, descontoCliente);
  };

  // Calcular o total do pedido
  const calcularTotal = (itens: ItemPedido[], descontoPercentual: number = 0) => {
    const novoTotal = calcularTotalPedido(itens, descontoPercentual);
    setTotal(novoTotal);
  };

  const handleSubmit = (data: PedidoFormData) => {
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

  const handleProdutoChange = (produtoId: string) => {
    setProdutoSelecionado(produtoId);
    const produto = produtos?.find(p => p.id === produtoId);
    if (produto) {
      setUnidade(produto.unidade);
    }
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numero_pedido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Pedido</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: PED-0001" 
                        {...field} 
                        readOnly={!editMode} // Somente leitura em criação, editável em atualização
                        className={!editMode ? "bg-gray-100" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleClienteChange(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientesLoading ? (
                          <SelectItem value="loading" disabled>Carregando clientes...</SelectItem>
                        ) : clientes && clientes.length > 0 ? (
                          clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nome} {cliente.desconto_especial ? `(${cliente.desconto_especial}% desc.)` : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>Nenhum cliente encontrado</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_emissao"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Emissão</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_entrega"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Entrega (opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {descontoCliente > 0 && (
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-green-600">
                    Cliente com desconto especial de {descontoCliente}% (será aplicado automaticamente)
                  </div>
                </div>
              )}
            </div>

            {/* Produtos */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Produto</label>
                      <Select onValueChange={handleProdutoChange} value={produtoSelecionado}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {produtosLoading ? (
                            <SelectItem value="loading" disabled>Carregando produtos...</SelectItem>
                          ) : produtos && produtos.length > 0 ? (
                            produtos.map((produto) => (
                              <SelectItem key={produto.id} value={produto.id}>
                                {produto.nome} - {formatarCurrency(produto.preco_unitario)}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty" disabled>Nenhum produto encontrado</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Quantidade</label>
                      <Input 
                        type="number" 
                        value={quantidade} 
                        onChange={(e) => setQuantidade(Number(e.target.value))} 
                        min={1}
                      />
                    </div>

                    {unidade === 'm²' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">Largura (m)</label>
                          <Input 
                            type="number" 
                            value={largura || ''} 
                            onChange={(e) => setLargura(Number(e.target.value))} 
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Altura (m)</label>
                          <Input 
                            type="number" 
                            value={altura || ''} 
                            onChange={(e) => setAltura(Number(e.target.value))} 
                            step="0.01"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        onClick={adicionarItem} 
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Adicionar
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead>Unidade</TableHead>
                          {unidade === 'm²' && (
                            <TableHead className="text-right">Dimensões</TableHead>
                          )}
                          <TableHead className="text-right">Valor Unit.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itensPedido.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                              Nenhum item adicionado
                            </TableCell>
                          </TableRow>
                        ) : (
                          itensPedido.map((item, index) => (
                            <TableRow key={item.id || index}>
                              <TableCell>{item.produto?.nome || item.descricao}</TableCell>
                              <TableCell className="text-right">{item.quantidade}</TableCell>
                              <TableCell>{item.unidade}</TableCell>
                              {unidade === 'm²' && (
                                <TableCell className="text-right">
                                  {item.largura && item.altura ? `${item.largura} x ${item.altura}` : "-"}
                                </TableCell>
                              )}
                              <TableCell className="text-right">{formatarCurrency(item.valor_unit)}</TableCell>
                              <TableCell className="text-right">{formatarCurrency(item.valor_total)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removerItem(index)}
                                  title="Remover item"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex flex-col gap-1 items-end">
                    {descontoCliente > 0 && (
                      <div className="text-right text-sm">
                        <span className="text-muted-foreground mr-2">Subtotal:</span>
                        <span>{formatarCurrency(calcularTotalPedido(itensPedido, 0))}</span>
                      </div>
                    )}
                    
                    {descontoCliente > 0 && (
                      <div className="text-right text-sm text-green-600">
                        <span className="mr-2">Desconto ({descontoCliente}%):</span>
                        <span>-{formatarCurrency(calcularTotalPedido(itensPedido, 0) - total)}</span>
                      </div>
                    )}
                    
                    <div className="text-right font-semibold">
                      <span className="text-muted-foreground mr-2">Total do Pedido:</span>
                      <span className="text-lg">{formatarCurrency(total)}</span>
                    </div>
                  </div>
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
