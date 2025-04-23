
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Produto } from "@/types";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProdutos } from "@/hooks/useProdutos";

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

export interface ProdutoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: Produto | undefined;
  isLoading: boolean;
  onSuccess: () => void;
}

export function ProdutoForm({ open, onOpenChange, produto, isLoading, onSuccess }: ProdutoFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!produto;
  const { createProduto, updateProduto } = useProdutos();

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
  useEffect(() => {
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
        await updateProduto.mutateAsync({
          ...produto,
          nome: data.nome,
          descricao: data.descricao,
          unidade: data.unidade,
          preco_unitario: Number(data.preco_unitario),
        });
      } else {
        // Criar novo produto
        await createProduto.mutateAsync({
          nome: data.nome,
          descricao: data.descricao,
          unidade: data.unidade,
          preco_unitario: Number(data.preco_unitario)
        });
      }
      
      // Call the onSuccess callback
      onSuccess();
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma unidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="un">Unidade (un)</SelectItem>
                      <SelectItem value="m²">Metro Quadrado (m²)</SelectItem>
                      <SelectItem value="kg">Quilograma (kg)</SelectItem>
                      <SelectItem value="l">Litro (l)</SelectItem>
                      <SelectItem value="caixa">Caixa</SelectItem>
                    </SelectContent>
                  </Select>
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
