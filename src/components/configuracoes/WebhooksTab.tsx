
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Webhook } from "@/types";
import { Loader2 } from "lucide-react";

export function WebhooksTab() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
            campos_selecionados: camposSelecionados
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
            <div className="pt-4">
              <Button onClick={saveWebhook} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : webhook ? "Atualizar Webhook" : "Salvar Webhook"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
