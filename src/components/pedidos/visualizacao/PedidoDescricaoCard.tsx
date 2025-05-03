
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PedidoDescricaoCardProps {
  descricao: string | undefined;
}

export function PedidoDescricaoCard({ descricao }: PedidoDescricaoCardProps) {
  if (!descricao) return null;
  
  return (
    <Card className="print-full-width mb-4">
      <CardHeader>
        <CardTitle>Descrição</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{descricao}</p>
      </CardContent>
    </Card>
  );
}
