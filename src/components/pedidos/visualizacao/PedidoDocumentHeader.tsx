
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Empresa } from "@/types";
import { formatarCpfCnpj } from "@/lib/utils";

interface PedidoDocumentHeaderProps {
  empresa: Empresa | null;
}

export function PedidoDocumentHeader({ empresa }: PedidoDocumentHeaderProps) {
  if (!empresa) return null;
  
  return (
    <>
      <Card className="border-none shadow-none print-mb-4">
        <CardContent className="p-0">
          <div className="flex flex-row items-center mb-4">
            {empresa.logo && (
              <div className="mr-4">
                <img 
                  src={empresa.logo} 
                  alt={empresa.nome_empresa} 
                  className="max-h-20" 
                />
              </div>
            )}
            <div className="flex flex-col">
              <h2 className="text-lg font-bold">{empresa.nome_empresa}</h2>
              {empresa.cnpj && <p className="text-sm">{formatarCpfCnpj(empresa.cnpj)}</p>}
              {empresa.endereco && <p className="text-sm">{empresa.endereco}</p>}
              {empresa.contato && <p className="text-sm">Contato: {empresa.contato}</p>}
              {empresa.email && <p className="text-sm">Email: {empresa.email}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
      <Separator className="my-4" />
    </>
  );
}
