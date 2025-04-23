import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Produto } from "@/types";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const produtoFormSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  descricao: z.string().optional(),
  unidade: z.string().min(1, "A unidade é obrigatória"),
  preco_unitario: z.string().refine((value) => {
    try {
      const num = parseFloat(value);
      return !isNaN(num);
    } catch (e) {
      return false;
    }
  }, "Preço unitário inválido"),
});

type ProdutoFormData = z.infer<typeof produtoFormSchema>;

interface ProdutoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: Produto | null;
  onSuccess: (produto: Produto, isNew: boolean) => void;
}

export function ProdutoForm({ open, onOpenChange, produto, onSuccess }: ProdutoFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!produto;

  const form = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoFormSchema),
    defaultValues: {
      nome: produto?.nome || "",
      descricao: produto?.descricao || "",
      unidade: produto?.unidade || "",
      preco_unitario: produto?.preco_unitario?.toString() || "0",
    },
  });

  // Atualiza o formulário quando o produto muda
  React.useEffect(() => {
    if (produto) {
      form.reset({
        nome: produto.nome,
        descricao: produto.descricao,
        unidade: produto.unidade,
        preco_unitario: produto.preco_unitario.toString(),
      });
    } else {
      form.reset({
        nome: "",
        descricao: "",
        unidade: "",
        preco_unitario: "0",
      });
    }
  }, [produto, form]);

  const onSubmit = async (data: ProdutoFormData) => {
    setIsSaving(true);
    try {
      if (isEditing) {
        // Atualizar produto existente
        const { data: updatedData, error } = await supabase
          .from('produtos')
          .update({
            nome: data.nome,
            descricao: data.descricao,
            unidade: data.unidade,
            preco_unitario: Number(data.preco_unitario),
          })
          .eq('id', produto.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Produto atualizado",
          description: "As informações do produto foram atualizadas com sucesso.",
        });

        onSuccess(updatedData as Produto, false);
      } else {
        // Criar novo produto
        const { data: newData, error } = await supabase
          .from('produtos')
          .insert({
            nome: data.nome,
            descricao: data.descricao,
            unidade: data.unidade,
            preco_unitario: Number(data.preco_unitario), // Garantir que é um number
            empresa_id: "00000000-0000-0000-0000-000000000000" // Placeholder, deve ser substituído pelo ID real
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Produto criado",
          description: "O novo produto foi criado com sucesso.",
        });

        onSuccess(newData as Produto, true);
      }
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Digite a descrição do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Kg, Unidade, Metro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preco_unitario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Unitário</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0.00" 
                      type="number"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : isEditing ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
