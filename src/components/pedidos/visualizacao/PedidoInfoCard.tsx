
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pedido } from "@/types";
import { formatarData, formatarCpfCnpj } from "@/lib/utils";

interface PedidoInfoCardProps {
  pedido: Pedido;
}

export function PedidoInfoCard({ pedido }: PedidoInfoCardProps) {
  return (
    <Card className="print-full-width mb-4">
      <CardHeader>
        <CardTitle>Informações do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p><span className="font-medium">Número do Pedido:</span> {pedido.numero_pedido}</p>
          <p><span className="font-medium">Cliente:</span> {pedido.cliente?.nome}</p>
          {pedido.cliente?.cpf_cnpj && (
            <p><span className="font-medium">CPF/CNPJ:</span> {formatarCpfCnpj(pedido.cliente.cpf_cnpj)}</p>
          )}
          {pedido.cliente?.contato && (
            <p><span className="font-medium">Contato:</span> {pedido.cliente.contato}</p>
          )}
          {pedido.cliente?.email && (
            <p><span className="font-medium">Email:</span> {pedido.cliente.email}</p>
          )}
          <p><span className="font-medium">Status:</span> {pedido.status}</p>
        </div>
        <div className="space-y-2">
          <p><span className="font-medium">Data de Emissão:</span> {formatarData(pedido.data_emissao)}</p>
          <p>
            <span className="font-medium">Data de Entrega:</span> {pedido.data_entrega ? formatarData(pedido.data_entrega) : '-'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
