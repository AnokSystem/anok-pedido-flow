
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function PedidoSignatureArea() {
  return (
    <Card className="print-mb-0 print-mt-8 border-none shadow-none">
      <CardContent className="p-4 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mt-4">
          <div className="text-center w-full">
            <div className="border-t border-gray-300 pt-2 w-full">
              <p className="text-sm text-gray-600">Assinatura do Vendedor</p>
            </div>
          </div>
          <div className="text-center w-full">
            <div className="border-t border-gray-300 pt-2 w-full">
              <p className="text-sm text-gray-600">Assinatura do Cliente</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
