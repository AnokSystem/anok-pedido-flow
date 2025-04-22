
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Cliente } from "@/types";
import { Textarea } from "@/components/ui/textarea";

const statusOptions = ["Criado", "Em Produção", "Pronto", "Entregue"];

interface PedidoHeaderFormProps {
  form: any;
  editMode: boolean;
  clientesLoading: boolean;
  clientes: Cliente[] | undefined;
  handleClienteChange: (clienteId: string) => void;
  descontoCliente: number;
}

export function PedidoHeaderForm({
  form,
  editMode,
  clientesLoading,
  clientes,
  handleClienteChange,
  descontoCliente
}: PedidoHeaderFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  readOnly={!editMode}
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
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleClienteChange(value);
                }} 
                value={field.value}
              >
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
                        {cliente.nome} {cliente.desconto_especial ? `(${cliente.desconto_especial}% desc.)` : ''}
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

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Descrição do Pedido (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informe uma descrição para este pedido..." 
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {descontoCliente > 0 && (
          <div className="md:col-span-2">
            <div className="text-sm font-medium text-green-600">
              Cliente com desconto especial de {descontoCliente}% (será aplicado automaticamente)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
