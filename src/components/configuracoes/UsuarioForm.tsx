
import React, { useState, useEffect } from "react";
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
import { Usuario } from "@/types";
import { Loader2 } from "lucide-react";

const usuarioFormSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("E-mail inválido").min(1, "O e-mail é obrigatório"),
  tipo_usuario: z.enum(["admin", "vendedor", "visualizador"], {
    required_error: "Selecione um tipo de usuário",
  }),
});

type UsuarioFormData = z.infer<typeof usuarioFormSchema>;

interface UsuarioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  onSuccess: (usuario: Usuario, isNew: boolean) => void;
}

export function UsuarioForm({ open, onOpenChange, usuario, onSuccess }: UsuarioFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!usuario;

  const form = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: {
      nome: usuario?.nome || "",
      email: usuario?.email || "",
      tipo_usuario: usuario?.tipo_usuario || "vendedor",
    },
  });

  // Atualiza o formulário quando o usuário muda
  useEffect(() => {
    if (usuario) {
      form.reset({
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
      });
    } else {
      form.reset({
        nome: "",
        email: "",
        tipo_usuario: "vendedor",
      });
    }
  }, [usuario, form]);

  const onSubmit = async (data: UsuarioFormData) => {
    setIsSaving(true);
    try {
      if (isEditing) {
        // Atualizar usuário existente
        const { data: updatedData, error } = await supabase
          .from('usuarios')
          .update({
            nome: data.nome,
            email: data.email,
            tipo_usuario: data.tipo_usuario,
          })
          .eq('id', usuario.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso.",
        });

        onSuccess(updatedData as Usuario, false);
      } else {
        // Criar novo usuário
        const { data: newData, error } = await supabase
          .from('usuarios')
          .insert({
            nome: data.nome,
            email: data.email,
            tipo_usuario: data.tipo_usuario,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Usuário criado",
          description: "O novo usuário foi criado com sucesso.",
        });

        onSuccess(newData as Usuario, true);
      }
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
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
          <DialogTitle>{isEditing ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
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
                    <Input placeholder="Digite o nome do usuário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="exemplo@empresa.com" 
                      type="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo_usuario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Usuário</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="visualizador">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
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
