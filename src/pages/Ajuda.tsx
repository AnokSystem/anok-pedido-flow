
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";

export default function Ajuda() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Ajuda e Suporte" 
        subtitle="Aprenda a usar o Anok Pedidos"
      />

      <Tabs defaultValue="inicio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inicio">Início Rápido</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inicio">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo ao Anok Pedidos</CardTitle>
              <CardDescription>
                Um guia simples para você começar a usar o sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Primeiros Passos</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-anok-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Configure sua empresa</h4>
                      <p className="text-muted-foreground text-sm">
                        Acesse o menu "Configurações" e preencha os dados da sua empresa para que eles apareçam nos PDFs de pedidos.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-anok-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Cadastre seus produtos</h4>
                      <p className="text-muted-foreground text-sm">
                        Vá para a seção "Produtos" e adicione os itens que você vende. Para produtos vendidos por m², marque a opção correspondente.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-anok-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Adicione seus clientes</h4>
                      <p className="text-muted-foreground text-sm">
                        Cadastre seus clientes na seção "Clientes". Você pode definir um desconto especial automático para cada cliente.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-anok-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Crie seu primeiro pedido</h4>
                      <p className="text-muted-foreground text-sm">
                        Vá para "Pedidos" e clique em "Novo Pedido". Selecione o cliente, adicione os produtos e finalize o pedido.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border bg-muted/40 p-4">
                <h3 className="font-medium mb-2">Precisa de ajuda?</h3>
                <p className="text-sm text-muted-foreground">
                  Se você tiver qualquer dúvida ou precisar de suporte, entre em contato pelo e-mail: 
                  <a href="mailto:suporte@anokpedidos.com" className="text-anok-500 hover:underline ml-1">
                    suporte@anokpedidos.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pedidos">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciando Pedidos</CardTitle>
              <CardDescription>
                Aprenda como criar, editar e acompanhar seus pedidos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium">Criando um novo pedido</h3>
                <p className="text-sm text-muted-foreground">
                  1. Clique no botão "Novo Pedido" na tela de pedidos<br />
                  2. Selecione o cliente no campo de busca<br />
                  3. Defina as datas de emissão e entrega<br />
                  4. Adicione os produtos clicando em "+ Adicionar Item"<br />
                  5. Para produtos vendidos por m², informe a largura e altura<br />
                  6. O sistema calculará automaticamente os valores<br />
                  7. Clique em "Salvar Pedido" para finalizar
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium">Atualizando status do pedido</h3>
                <p className="text-sm text-muted-foreground">
                  Você pode alterar o status do pedido (Criado, Em Produção, Pronto, Entregue) diretamente na edição do pedido ou na tela de visualização.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium">Imprimindo e enviando pedidos</h3>
                <p className="text-sm text-muted-foreground">
                  Na tela de visualização do pedido, clique nos botões "Imprimir" ou "Enviar" para gerar o PDF e compartilhar com seu cliente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clientes">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciando Clientes</CardTitle>
              <CardDescription>
                Aprenda como cadastrar e gerenciar seus clientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Registro e gerenciamento de clientes e leads, com informações detalhadas e descontos automáticos.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciando Produtos</CardTitle>
              <CardDescription>
                Aprenda como cadastrar e gerenciar seus produtos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Cadastro de produtos com suporte a diferentes unidades de medida, incluindo cálculo automático para m².
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
