
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pedido } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientes } from "@/hooks/useClientes";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { usePedidos } from "@/hooks/usePedidos";
import { gerarNumeroSequencial } from "@/lib/utils";

const statusOptions = ["Criado", "Em Produção", "Pronto", "Entregue"];

const pedidoSchema = z.object({
  numero_pedido: z.string().min(1, "O número do pedido é obrigatório"),
  cliente_id: z.string().min(1, "Selecione um cliente"),
  data_emissao: z.date(),
  data_entrega: z.date().optional(),
  status: z.string().min(1, "Selecione um status"),
});

type PedidoFormData = z.infer<typeof pedidoSchema>;

interface PedidoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PedidoFormData) => void;
  pedido?: Pedido;
  isLoading: boolean;
}

export function PedidoForm({ open, onOpenChange, onSubmit, pedido, isLoading }: PedidoFormProps) {
  const { clientes, isLoading: clientesLoading } = useClientes();
  const { pedidos } = usePedidos();
  const [numeroPedidoGerado, setNumeroPedidoGerado] = useState("");
  const editMode = !!pedido;
  
  // Gera um número de pedido automático quando abrir o form para novo pedido
  useEffect(() => {
    if (open && !editMode) {
      // Conta quantos pedidos já existem e adiciona 1
      const proximoNumero = (pedidos?.length || 0) + 1;
      const novoNumeroPedido = gerarNumeroSequencial("PED", proximoNumero);
      setNumeroPedidoGerado(novoNumeroPedido);
    }
  }, [open, editMode, pedidos]);
  
  const form = useForm<PedidoFormData>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      numero_pedido: pedido?.numero_pedido || "",
      cliente_id: pedido?.cliente_id || "",
      data_emissao: pedido?.data_emissao ? new Date(pedido.data_emissao) : new Date(),
      data_entrega: pedido?.data_entrega ? new Date(pedido.data_entrega) : undefined,
      status: pedido?.status || "Criado",
    },
  });

  // Reset form values when pedido changes
  useEffect(() => {
    if (open) {
      if (editMode && pedido) {
        // In edit mode, load existing pedido data
        form.reset({
          numero_pedido: pedido.numero_pedido,
          cliente_id: pedido.cliente_id,
          data_emissao: pedido.data_emissao ? new Date(pedido.data_emissao) : new Date(),
          data_entrega: pedido.data_entrega ? new Date(pedido.data_entrega) : undefined,
          status: pedido.status,
        });
      } else {
        // In creation mode, reset to defaults with generated number
        form.reset({
          numero_pedido: numeroPedidoGerado,
          cliente_id: "",
          data_emissao: new Date(),
          data_entrega: undefined,
          status: "Criado",
        });
      }
    }
  }, [open, editMode, pedido, form, numeroPedidoGerado]);

  // Atualiza o valor do formulário quando o número do pedido é gerado
  useEffect(() => {
    if (numeroPedidoGerado && !editMode && open) {
      form.setValue("numero_pedido", numeroPedidoGerado);
    }
  }, [numeroPedidoGerado, form, editMode, open]);

  const handleSubmit = (data: PedidoFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editMode ? "Editar Pedido" : "Novo Pedido"}</DialogTitle>
          <DialogDescription>
            {editMode ? "Atualize as informações do pedido" : "Preencha as informações para criar um novo pedido"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="numero_pedido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Pedido</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: PED-0001" 
                      {...field} 
                      readOnly={!editMode} // Somente leitura em criação, editável em atualização
                      className={!editMode ? "bg-gray-100" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientesLoading ? (
                        <SelectItem value="loading" disabled>Carregando clientes...</SelectItem>
                      ) : clientes && clientes.length > 0 ? (
                        clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>Nenhum cliente encontrado</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_emissao"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Emissão</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_entrega"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Entrega (opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
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
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : editMode ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
