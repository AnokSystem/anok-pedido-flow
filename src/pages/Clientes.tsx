
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
import { formatarCpfCnpj } from "@/lib/utils";
import { Edit, FileDown, FileUp, UserPlus, Trash } from "lucide-react";
import { useClientes } from "@/hooks/useClientes";
import { ClienteForm } from "@/components/clientes/ClienteForm";
import { ImportClientsDialog } from "@/components/clientes/ImportClientsDialog";
import { Cliente } from "@/types";
import { toast } from "@/hooks/use-toast";
import { downloadCSV, exportClientesToCSV } from "@/lib/csvUtils";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";

export default function Clientes() {
  const { clientes, isLoading, createCliente, updateCliente, deleteCliente, importClientes } = useClientes();
  
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleOpenNewForm = () => {
    setSelectedCliente(undefined);
    setFormOpen(true);
  };

  const handleOpenEditForm = (cliente: Cliente) => {
    console.log("Editando cliente:", cliente);
    setSelectedCliente(cliente);
    setFormOpen(true);
  };

  const handleOpenDeleteConfirm = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setConfirmDeleteOpen(true);
  };

  const handleExportClientes = () => {
    if (!clientes || clientes.length === 0) {
      toast({
        title: "Nenhum cliente para exportar",
        description: "Não há clientes cadastrados para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const csvContent = exportClientesToCSV(clientes);
      const fileName = `clientes-export-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, fileName);
      
      toast({
        title: "Clientes exportados",
        description: `${clientes.length} clientes foram exportados com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao exportar clientes:", error);
      toast({
        title: "Erro ao exportar",
        description: "Ocorreu um erro ao exportar os clientes.",
        variant: "destructive",
      });
    }
  };

  const handleImportClientes = async (clientesToImport: Omit<Cliente, 'id'>[]) => {
    if (!clientesToImport.length) return;
    
    setIsImporting(true);
    try {
      await importClientes.mutateAsync(clientesToImport);
      setImportOpen(false);
    } catch (error) {
      console.error("Erro ao importar clientes:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      if (selectedCliente) {
        // Editar cliente existente
        console.log("Atualizando cliente com dados:", data);
        await updateCliente.mutateAsync({
          ...data,
          id: selectedCliente.id
        });
      } else {
        // Adicionar novo cliente
        const novoCliente = {
          ...data
        };
        
        await createCliente.mutateAsync(novoCliente);
      }
      setFormOpen(false);
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o cliente: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCliente) return;

    try {
      setIsDeleting(true);
      await deleteCliente.mutateAsync(selectedCliente.id);
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });
      setConfirmDeleteOpen(false);
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o cliente: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Clientes" 
        subtitle="Gerencie seus clientes e leads"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => setImportOpen(true)}
            >
              <FileUp className="h-4 w-4" />
              <span>Importar</span>
            </Button>
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={handleExportClientes} 
              disabled={!clientes?.length || isLoading}
            >
              <FileDown className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
            <Button className="gap-1" onClick={handleOpenNewForm}>
              <UserPlus className="h-4 w-4" />
              <span>Novo Cliente</span>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Carregando clientes...</p>
            </div>
          ) : !clientes || clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhum cliente cadastrado</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-1">
                  <FileUp className="h-4 w-4" />
                  Importar clientes
                </Button>
                <Button variant="outline" onClick={handleOpenNewForm}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar primeiro cliente
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Desconto</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes?.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{formatarCpfCnpj(cliente.cpf_cnpj)}</TableCell>
                    <TableCell>{cliente.contato}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell className="text-right">
                      {cliente.desconto_especial ? `${cliente.desconto_especial}%` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenEditForm(cliente)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDeleteConfirm(cliente)}
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

      {/* Formulário de cliente (novo/editar) */}
      <ClienteForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        cliente={selectedCliente}
        isLoading={isSubmitting}
      />

      {/* Diálogo de importação de clientes */}
      <ImportClientsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImportClientes}
        isLoading={isImporting}
      />

      {/* Confirmação de exclusão */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente 
              "{selectedCliente?.nome}" e pode afetar pedidos associados a este cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
