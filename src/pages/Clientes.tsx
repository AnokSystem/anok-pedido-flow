
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
import { Edit, UserPlus, Trash } from "lucide-react";
import { useClientes } from "@/hooks/useClientes";

export default function Clientes() {
  const { clientes, isLoading } = useClientes();

  if (isLoading) {
    return <div>Carregando clientes...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Clientes" 
        subtitle="Gerencie seus clientes e leads"
        actions={
          <Button className="gap-1">
            <UserPlus className="h-4 w-4" />
            <span>Novo Cliente</span>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
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
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
