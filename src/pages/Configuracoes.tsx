
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Empresa } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { UsuariosTab } from "@/components/configuracoes/UsuariosTab";
import { WebhooksTab } from "@/components/configuracoes/WebhooksTab";
import { empresaMock } from "@/lib/mockData";

export default function Configuracoes() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Carregar dados da empresa
  useEffect(() => {
    const fetchEmpresa = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .limit(1)
          .single();

        if (error) {
          console.error('Erro ao carregar dados da empresa:', error);
          // Use mock data if no company found
          setEmpresa(empresaMock);
        } else {
          setEmpresa(data as Empresa);
          if (data.logo) {
            setLogoPreview(data.logo);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados da empresa:', error);
        setEmpresa(empresaMock);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmpresa();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEmpresa(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('image/')) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Por favor, selecione uma imagem (JPG, PNG, GIF).",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive"
      });
      return;
    }

    setLogoFile(file);
    
    // Preview the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSaveChanges = async () => {
    if (!empresa) return;
    
    setIsSaving(true);
    try {
      let logoUrl = empresa.logo;

      // First upload the logo if there's a new file
      if (logoFile) {
        setIsUploading(true);
        // Convert the image to base64 for storage
        // This is a simple approach - in a production app, you might use actual file storage
        const reader = new FileReader();
        logoUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(logoFile);
        });
        setIsUploading(false);
      }

      // Then update the company information
      const { error } = await supabase
        .from('empresas')
        .update({
          nome_empresa: empresa.nome_empresa,
          cnpj: empresa.cnpj,
          endereco: empresa.endereco,
          contato: empresa.contato,
          email: empresa.email,
          pix: empresa.pix,
          logo: logoUrl
        })
        .eq('id', empresa.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Alterações salvas",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Configurações" 
        subtitle="Gerencie as configurações da sua empresa"
      />

      <Tabs defaultValue="empresa" className="space-y-4">
        <TabsList>
          <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="webhook">Webhooks</TabsTrigger>
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
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo da Empresa</Label>
                    <div className="flex flex-col gap-4">
                      {logoPreview && (
                        <div className="border rounded-md p-4 flex flex-col items-center gap-2">
                          <img 
                            src={logoPreview} 
                            alt="Logo da Empresa" 
                            className="max-h-24 object-contain" 
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRemoveLogo}
                          >
                            Remover Logo
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          id="logo_file"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                        <Label 
                          htmlFor="logo_file" 
                          className="cursor-pointer flex items-center gap-2 border rounded-md px-4 py-2 hover:bg-accent"
                        >
                          <Upload className="h-4 w-4" />
                          {logoPreview ? 'Alterar Logo' : 'Upload Logo'}
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          Formatos: PNG, JPG, GIF (Max: 2MB)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome_empresa">Nome da Empresa</Label>
                    <Input 
                      id="nome_empresa" 
                      value={empresa?.nome_empresa || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input 
                      id="cnpj" 
                      value={empresa?.cnpj || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço Completo</Label>
                    <Textarea 
                      id="endereco" 
                      value={empresa?.endereco || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contato">Telefone</Label>
                      <Input 
                        id="contato" 
                        value={empresa?.contato || ''} 
                        onChange={handleChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email" 
                        value={empresa?.email || ''} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pix">Chave PIX</Label>
                    <Input 
                      id="pix" 
                      value={empresa?.pix || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="pt-4">
                    <Button 
                      onClick={handleSaveChanges} 
                      disabled={isSaving || isUploading}
                    >
                      {(isSaving || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSaving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="usuarios" className="space-y-4">
          <UsuariosTab />
        </TabsContent>
        
        <TabsContent value="webhook" className="space-y-4">
          <WebhooksTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
