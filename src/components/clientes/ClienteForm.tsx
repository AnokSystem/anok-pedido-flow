
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Cliente } from "@/types";

const clienteSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  cpf_cnpj: z.string().min(1, "CPF/CNPJ é obrigatório"),
  rua: z.string().min(1, "A rua é obrigatória"),
  numero: z.string().min(1, "O número é obrigatório"),
  bairro: z.string().min(1, "O bairro é obrigatório"),
  cidade: z.string().min(1, "A cidade é obrigatória"),
  contato: z.string().min(1, "O contato é obrigatório"),
  email: z.string().email("Email inválido").or(z.string().length(0)),
  responsavel: z.string().optional(),
  desconto_especial: z.coerce.number().optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  cliente?: Cliente;
  isLoading: boolean;
}

export function ClienteForm({ open, onOpenChange, onSubmit, cliente, isLoading }: ClienteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editMode = !!cliente;
  
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: "",
      cpf_cnpj: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      contato: "",
      email: "",
      responsavel: "",
      desconto_especial: undefined,
    },
  });

  // Reset form when cliente changes or when modal opens/closes
  useEffect(() => {
    if (cliente) {
      form.reset({
        nome: cliente.nome || "",
        cpf_cnpj: cliente.cpf_cnpj || "",
        rua: cliente.rua || "",
        numero: cliente.numero || "",
        bairro: cliente.bairro || "",
        cidade: cliente.cidade || "",
        contato: cliente.contato || "",
        email: cliente.email || "",
        responsavel: cliente.responsavel || "",
        desconto_especial: cliente.desconto_especial !== null ? cliente.desconto_especial : undefined,
      });
    } else if (open) {
      form.reset({
        nome: "",
        cpf_cnpj: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        contato: "",
        email: "",
        responsavel: "",
        desconto_especial: undefined,
      });
    }
  }, [cliente, open, form]);

  const handleSubmit = (data: ClienteFormData) => {
    setIsSubmitting(true);
    
    // Prepare data for submission
    const clienteData = {
      ...data,
      desconto_especial: data.desconto_especial || null,
    };
    
    console.log("Enviando dados:", clienteData);
    console.log("Edit mode:", editMode);
    console.log("Cliente original:", cliente);
    
    try {
      if (editMode && cliente) {
        // Editar cliente existente
        onSubmit({
          id: cliente.id,
          ...clienteData,
        });
      } else {
        // Adicionar novo cliente
        onSubmit(clienteData);
      }
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editMode ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>
            {editMode ? "Atualize as informações do cliente" : "Preencha as informações para criar um novo cliente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf_cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="CPF ou CNPJ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rua"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="Número" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Telefone ou celular" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsavel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="desconto_especial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto Especial % (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 10" 
                        {...field} 
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value ? Number(e.target.value) : undefined;
                          field.onChange(value);
                        }}
                        min="0"
                        max="100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading || isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isSubmitting}>
                {isLoading || isSubmitting ? "Salvando..." : editMode ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
