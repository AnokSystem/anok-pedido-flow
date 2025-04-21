
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatarCurrency, formatarData } from "@/lib/utils";
import { Copy, Edit, Eye, FilePlus2, Printer, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { usePedidos } from "@/hooks/usePedidos";
import { PedidoForm } from "@/components/pedidos/PedidoForm";
import { Pedido } from "@/types";
import { toast } from "@/hooks/use-toast";
import { PedidoVisualizacao } from "@/components/pedidos/PedidoVisualizacao";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

const statusColors = {
  'Criado': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'Em Produção': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  'Pronto': 'bg-green-100 text-green-800 hover:bg-green-200',
  'Entregue': 'bg-gray-100 text-gray-800 hover:bg-gray-200'
};

export default function Pedidos() {
  const { pedidos, isLoading, createPedido, updatePedido, getPedidoById } = usePedidos();
  
  const [formOpen, setFormOpen] = useState(false);
  const [visualizacaoOpen, setVisualizacaoOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | undefined>(undefined);
  const [pedidoParaVisualizar, setPedidoParaVisualizar] = useState<Pedido | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);

  const handleOpenNewForm = () => {
    setSelectedPedido(undefined);
    setFormOpen(true);
  };

  const handleOpenEditForm = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setFormOpen(true);
  };

  const handleOpenVisualizacao = async (pedido: Pedido) => {
    try {
      setIsLoading1(true);
      // Buscar detalhes atualizados do pedido
      const pedidoDetalhado = await getPedidoById(pedido.id);
      if (pedidoDetalhado) {
        setPedidoParaVisualizar(pedidoDetalhado);
        setVisualizacaoOpen(true);
      } else {
        toast({
          title: "Erro ao carregar pedido",
          description: "Não foi possível carregar os detalhes do pedido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar pedido para visualização:", error);
      toast({
        title: "Erro ao carregar pedido",
        description: "Não foi possível carregar os detalhes do pedido",
        variant: "destructive",
      });
    } finally {
      setIsLoading1(false);
    }
  };

  const handleOpenDeleteConfirm = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setConfirmDeleteOpen(true);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      if (selectedPedido) {
        // Editar pedido existente
        await updatePedido.mutateAsync({
          ...selectedPedido,
          ...data,
          // Manter os itens do pedido original
          itens: selectedPedido.itens || []
        });
      } else {
        // Adicionar novo pedido
        const novoPedido = {
          ...data,
          total: 0, // Valor inicial, será atualizado ao adicionar itens
          itens: [] // Itens serão adicionados em etapa posterior
        };
        
        console.log('Enviando pedido para criação:', novoPedido);
        await createPedido.mutateAsync(novoPedido);
      }
      setFormOpen(false);
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o pedido: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImprimir = async (pedido: Pedido) => {
    try {
      // Buscar detalhes atualizados do pedido
      const pedidoDetalhado = await getPedidoById(pedido.id);
      if (pedidoDetalhado) {
        setPedidoParaVisualizar(pedidoDetalhado);
        // Abrir visualização e imprimir após o componente ser montado
        setVisualizacaoOpen(true);
        setTimeout(() => {
          window.print();
        }, 500);
      } else {
        toast({
          title: "Erro ao carregar pedido",
          description: "Não foi possível carregar os detalhes do pedido para impressão",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao imprimir",
        description: "Ocorreu um erro ao preparar o pedido para impressão",
        variant: "destructive",
      });
    }
  };

  const handleClonar = (pedido: Pedido) => {
    toast({
      title: "Clonagem não implementada",
      description: "A clonagem de pedidos será implementada em uma atualização futura",
    });
  };

  const handleDelete = async () => {
    // A funcionalidade de exclusão será implementada em uma etapa futura
    setConfirmDeleteOpen(false);
    toast({
      title: "Exclusão não implementada",
      description: "A exclusão de pedidos será implementada em uma atualização futura",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Pedidos" 
        subtitle="Gerencie seus pedidos de clientes"
        actions={
          <Button className="gap-1" onClick={handleOpenNewForm}>
            <FilePlus2 className="h-4 w-4" />
            <span>Novo Pedido</span>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Carregando pedidos...</p>
            </div>
          ) : !pedidos || pedidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhum pedido cadastrado</p>
              <Button variant="outline" onClick={handleOpenNewForm}>
                <FilePlus2 className="h-4 w-4 mr-2" />
                Criar primeiro pedido
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead>Data Entrega</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos?.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium hover:text-anok-500"
                        onClick={() => handleOpenVisualizacao(pedido)}
                      >
                        {pedido.numero_pedido}
                      </Button>
                    </TableCell>
                    <TableCell>{pedido.cliente?.nome}</TableCell>
                    <TableCell>{formatarData(pedido.data_emissao)}</TableCell>
                    <TableCell>{pedido.data_entrega ? formatarData(pedido.data_entrega) : '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={statusColors[pedido.status]}
                      >
                        {pedido.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatarCurrency(pedido.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Visualizar"
                          onClick={() => handleOpenVisualizacao(pedido)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Imprimir"
                          onClick={() => handleImprimir(pedido)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Editar"
                          onClick={() => handleOpenEditForm(pedido)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Clonar"
                          onClick={() => handleClonar(pedido)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Excluir"
                          onClick={() => handleOpenDeleteConfirm(pedido)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PedidoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        pedido={selectedPedido}
        isLoading={isSubmitting}
      />

      <PedidoVisualizacao
        open={visualizacaoOpen}
        onOpenChange={setVisualizacaoOpen}
        pedido={pedidoParaVisualizar}
      />

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o pedido 
              "{selectedPedido?.numero_pedido}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
