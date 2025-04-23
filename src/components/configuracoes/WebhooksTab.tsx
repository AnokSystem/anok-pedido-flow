
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Webhook } from "@/types";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function WebhooksTab() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [url, setUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedFields, setSelectedFields] = useState({
    numero_pedido: true,
    cliente: true,
    itens: true,
    valor: true,
    pdf: true
  });

  useEffect(() => {
    fetchWebhook();
  }, []);

  const fetchWebhook = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setWebhook(data as Webhook);
        setUrl(data.url_destino);
        setIsActive(data.ativado || false);
        
        // Processar campos selecionados se existirem
        if (data.campos_selecionados && Array.isArray(data.campos_selecionados)) {
          const fields = {
            numero_pedido: data.campos_selecionados.includes('numero_pedido'),
            cliente: data.campos_selecionados.includes('cliente'),
            itens: data.campos_selecionados.includes('itens'),
            valor: data.campos_selecionados.includes('valor'),
            pdf: data.campos_selecionados.includes('pdf')
          };
          setSelectedFields(fields);
        }
      }
    } catch (error: any) {
      console.error('Erro ao buscar webhook:', error);
      toast({
        title: "Erro ao carregar webhook",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: string, checked: boolean) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const saveWebhook = async () => {
    if (!url.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Informe a URL do webhook.",
        variant: "destructive",
      });
      return;
    }

    // Validar URL
    try {
      new URL(url);
    } catch (error) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    // Converter os campos selecionados para array
    const camposSelecionados = Object.entries(selectedFields)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);

    try {
      if (webhook) {
        // Atualizar webhook existente
        const { error } = await supabase
          .from('webhooks')
          .update({
            url_destino: url,
            ativado: isActive,
            campos_selecionados: camposSelecionados
          })
          .eq('id', webhook.id);

        if (error) throw error;

        setWebhook(prev => {
          if (!prev) return null;
          return {
            ...prev,
            url_destino: url,
            ativado: isActive,
            campos_selecionados: camposSelecionados
          };
        });

        toast({
          title: "Webhook atualizado",
          description: "As configurações do webhook foram atualizadas com sucesso.",
        });
      } else {
        // Criar novo webhook
        const { data, error } = await supabase
          .from('webhooks')
          .insert({
            url_destino: url,
            ativado: isActive,
            campos_selecionados: camposSelecionados,
            empresa_id: 'default' // Usando um valor padrão para empresa_id
          })
          .select()
          .single();

        if (error) throw error;

        setWebhook(data as Webhook);

        toast({
          title: "Webhook criado",
          description: "O webhook foi configurado com sucesso.",
        });
      }
    } catch (error: any) {
      console.error('Erro ao salvar webhook:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testWebhook = async () => {
    if (!url.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Informe a URL do webhook para testar.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    
    try {
      // Criar dados de teste baseados nos campos selecionados
      const testData: Record<string, any> = {
        evento: 'teste_webhook',
        timestamp: new Date().toISOString()
      };
      
      if (selectedFields.numero_pedido) {
        testData.numero_pedido = 'TESTE-0001';
      }
      
      if (selectedFields.cliente) {
        testData.cliente = {
          nome: 'Cliente Teste',
          email: 'cliente@teste.com',
          cpf_cnpj: '123.456.789-00'
        };
      }
      
      if (selectedFields.itens) {
        testData.itens = [
          {
            descricao: 'Produto de Teste 1',
            quantidade: 2,
            valor_unit: 99.90,
            valor_total: 199.80
          },
          {
            descricao: 'Produto de Teste 2',
            quantidade: 1,
            valor_unit: 50.00,
            valor_total: 50.00
          }
        ];
      }
      
      if (selectedFields.valor) {
        testData.valor_total = 249.80;
      }
      
      if (selectedFields.pdf) {
        testData.pdf_url = 'https://exemplo.com/pedidos/TESTE-0001.pdf';
      }
      
      console.log('Enviando dados de teste para webhook:', url);
      console.log('Dados:', testData);
      
      // Enviar requisição para o webhook
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
        // Usando no-cors para evitar problemas de CORS com serviços externos
        mode: 'no-cors'
      });
      
      // Como estamos usando no-cors, não podemos acessar o status da resposta
      // Então assumimos que foi enviado com sucesso
      toast({
        title: "Teste enviado",
        description: "Dados de teste foram enviados para o webhook. Verifique se foram recebidos no destino.",
      });
      
    } catch (error: any) {
      console.error('Erro ao testar webhook:', error);
      toast({
        title: "Erro ao testar webhook",
        description: "Não foi possível enviar os dados de teste. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Webhook</CardTitle>
        <CardDescription>
          Configure webhooks para integrar com outros sistemas quando um pedido for criado ou alterado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Dica de uso</AlertTitle>
              <AlertDescription>
                Use webhooks para integrar com serviços como Zapier, Make.com, Integromat ou seu próprio sistema. 
                Eles serão notificados automaticamente quando pedidos forem criados ou atualizados.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="webhook_url">URL do Webhook</Label>
              <Input 
                id="webhook_url" 
                placeholder="https://" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="webhook_ativo" 
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="webhook_ativo">Webhook Ativo</Label>
            </div>
            <div className="space-y-2">
              <Label>Dados a Enviar</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="webhook_numero_pedido" 
                    checked={selectedFields.numero_pedido}
                    onCheckedChange={(checked) => handleFieldChange('numero_pedido', checked)}
                  />
                  <Label htmlFor="webhook_numero_pedido">Número do Pedido</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="webhook_cliente" 
                    checked={selectedFields.cliente}
                    onCheckedChange={(checked) => handleFieldChange('cliente', checked)}
                  />
                  <Label htmlFor="webhook_cliente">Dados do Cliente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="webhook_itens" 
                    checked={selectedFields.itens}
                    onCheckedChange={(checked) => handleFieldChange('itens', checked)}
                  />
                  <Label htmlFor="webhook_itens">Itens do Pedido</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="webhook_valor" 
                    checked={selectedFields.valor}
                    onCheckedChange={(checked) => handleFieldChange('valor', checked)}
                  />
                  <Label htmlFor="webhook_valor">Valor Total</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="webhook_pdf" 
                    checked={selectedFields.pdf}
                    onCheckedChange={(checked) => handleFieldChange('pdf', checked)}
                  />
                  <Label htmlFor="webhook_pdf">Link do PDF</Label>
                </div>
              </div>
            </div>
            <div className="pt-4 flex flex-wrap gap-2">
              <Button onClick={saveWebhook} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : webhook ? "Atualizar Webhook" : "Salvar Webhook"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={testWebhook} 
                disabled={isTesting || !url.trim()}
                className="ml-2"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Testar Webhook
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
