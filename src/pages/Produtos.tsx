import { useState } from "react";
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
import { formatarCurrency } from "@/lib/utils";
import { Edit, PackagePlus, Trash } from "lucide-react";
import { useProdutos } from "@/hooks/useProdutos";
import { Produto } from "@/types";
import { ProdutoForm } from "@/components/produtos/ProdutoForm";
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
import { toast } from "@/hooks/use-toast";

export default function Produtos() {
  const { produtos, isLoading, createProduto, updateProduto } = useProdutos();
  
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenNewForm = () => {
    setSelectedProduto(undefined);
    setFormOpen(true);
  };

  const handleOpenEditForm = (produto: Produto) => {
    setSelectedProduto(produto);
    setFormOpen(true);
  };

  const handleOpenDeleteConfirm = (produto: Produto) => {
    setSelectedProduto(produto);
    setConfirmDeleteOpen(true);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log('Criando produto:', data);
    
    try {
      if (selectedProduto) {
        // Editar produto existente
        await updateProduto.mutateAsync({
          ...selectedProduto,
          ...data
        });
      } else {
        // Adicionar novo produto
        const novoProduto = {
          ...data
        };
        
        await createProduto.mutateAsync(novoProduto);
      }
      setFormOpen(false);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o produto: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    // A funcionalidade de exclusão será implementada em uma etapa futura
    setConfirmDeleteOpen(false);
    toast({
      title: "Exclusão não implementada",
      description: "A exclusão de produtos será implementada em uma atualização futura",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Produtos" 
        subtitle="Gerencie seu catálogo de produtos"
        actions={
          <Button className="gap-1" onClick={handleOpenNewForm}>
            <PackagePlus className="h-4 w-4" />
            <span>Novo Produto</span>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Carregando produtos...</p>
            </div>
          ) : !produtos || produtos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhum produto cadastrado</p>
              <Button variant="outline" onClick={handleOpenNewForm}>
                <PackagePlus className="h-4 w-4 mr-2" />
                Adicionar primeiro produto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Preço Unitário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>{produto.descricao || "-"}</TableCell>
                    <TableCell className="uppercase">{produto.unidade}</TableCell>
                    <TableCell className="text-right">
                      {formatarCurrency(produto.preco_unitario)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenEditForm(produto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDeleteConfirm(produto)}
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

      {/* Formulário de produto (novo/editar) */}
      <ProdutoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        produto={selectedProduto}
        isLoading={isSubmitting}
      />

      {/* Confirmação de exclusão */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto 
              "{selectedProduto?.nome}" e pode afetar pedidos que contenham este produto.
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
