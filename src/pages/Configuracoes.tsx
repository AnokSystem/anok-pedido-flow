
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { empresaMock } from "@/lib/mockData";

export default function Configuracoes() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Configurações" 
        subtitle="Gerencie as configurações da sua empresa"
      />

      <Tabs defaultValue="empresa" className="space-y-4">
        <TabsList>
          <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
          <TabsTrigger value="webhook">Webhooks</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="empresa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Gerencie os dados básicos da sua empresa que serão exibidos nos documentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_empresa">Nome da Empresa</Label>
                <Input id="nome_empresa" defaultValue={empresaMock.nome_empresa} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" defaultValue={empresaMock.cnpj} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Textarea id="endereco" defaultValue={empresaMock.endereco} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contato">Telefone</Label>
                  <Input id="contato" defaultValue={empresaMock.contato} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" defaultValue={empresaMock.email} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pix">Chave PIX</Label>
                <Input id="pix" defaultValue={empresaMock.pix} />
              </div>
              <div className="pt-4">
                <Button>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhook</CardTitle>
              <CardDescription>
                Configure webhooks para integrar com outros sistemas quando um pedido for criado ou alterado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook_url">URL do Webhook</Label>
                <Input id="webhook_url" placeholder="https://" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="webhook_ativo" />
                <Label htmlFor="webhook_ativo">Webhook Ativo</Label>
              </div>
              <div className="space-y-2">
                <Label>Dados a Enviar</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="webhook_numero_pedido" defaultChecked />
                    <Label htmlFor="webhook_numero_pedido">Número do Pedido</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="webhook_cliente" defaultChecked />
                    <Label htmlFor="webhook_cliente">Dados do Cliente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="webhook_itens" defaultChecked />
                    <Label htmlFor="webhook_itens">Itens do Pedido</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="webhook_valor" defaultChecked />
                    <Label htmlFor="webhook_valor">Valor Total</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="webhook_pdf" defaultChecked />
                    <Label htmlFor="webhook_pdf">Link do PDF</Label>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button>Salvar Webhook</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Adicione e gerencie usuários que têm acesso ao sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Usuários do Sistema</Label>
                <div className="rounded-md border">
                  <div className="p-4 flex justify-between items-center border-b">
                    <div>
                      <p className="font-medium">Admin</p>
                      <p className="text-sm text-muted-foreground">admin@anok.com</p>
                    </div>
                    <Badge>Administrador</Badge>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">Vendedor</p>
                      <p className="text-sm text-muted-foreground">vendedor@anok.com</p>
                    </div>
                    <Badge variant="outline">Vendedor</Badge>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button>Adicionar Usuário</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Temos que declarar o Badge aqui porque não foi importado
function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "outline", className?: string }) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-input bg-background"
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className || ""}`}>
      {children}
    </span>
  );
}
