
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { produtosMock } from "@/lib/mockData";
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

export default function Produtos() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Produtos" 
        subtitle="Gerencie seu catálogo de produtos"
        actions={
          <Button className="gap-1">
            <PackagePlus className="h-4 w-4" />
            <span>Novo Produto</span>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
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
              {produtosMock.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell className="font-medium">{produto.nome}</TableCell>
                  <TableCell>{produto.descricao}</TableCell>
                  <TableCell className="uppercase">{produto.unidade}</TableCell>
                  <TableCell className="text-right">
                    {formatarCurrency(produto.preco_unitario)}
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
