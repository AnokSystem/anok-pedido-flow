
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Produto } from "@/types";
import { formatarCurrency } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface PedidoItemFormProps {
  produtosLoading: boolean;
  produtos: Produto[] | undefined;
  produtoSelecionado: string;
  quantidade: number;
  largura: number | undefined;
  altura: number | undefined;
  unidade: "un" | "m²" | "kg" | "l" | "caixa";
  descricao: string;
  handleProdutoChange: (produtoId: string) => void;
  setQuantidade: (quantidade: number) => void;
  setLargura: (largura: number | undefined) => void;
  setAltura: (altura: number | undefined) => void;
  setUnidade: (unidade: "un" | "m²" | "kg" | "l" | "caixa") => void;
  setDescricao: (descricao: string) => void;
  adicionarItem: () => void;
}

export function PedidoItemForm({
  produtosLoading,
  produtos,
  produtoSelecionado,
  quantidade,
  largura,
  altura,
  unidade,
  descricao,
  handleProdutoChange,
  setQuantidade,
  setLargura,
  setAltura,
  setUnidade,
  setDescricao,
  adicionarItem,
}: PedidoItemFormProps) {
  // Find the selected product to determine if it's m²
  const produtoSelecionadoObj = produtos?.find(p => p.id === produtoSelecionado);
  const isProdutoM2 = produtoSelecionadoObj?.unidade === 'm²';
  
  // Update unidade whenever product changes
  useEffect(() => {
    if (produtoSelecionadoObj) {
      setUnidade(produtoSelecionadoObj.unidade as "un" | "m²" | "kg" | "l" | "caixa");
    }
  }, [produtoSelecionadoObj, setUnidade]);
  
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="col-span-full">
        <label className="block text-sm font-medium mb-1">Descrição do Item</label>
        <Textarea 
          placeholder="Descreva informações sobre o item ou material utilizado..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="min-h-[60px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Produto</label>
          <Select onValueChange={handleProdutoChange} value={produtoSelecionado}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {produtosLoading ? (
                <SelectItem value="loading" disabled>Carregando produtos...</SelectItem>
              ) : produtos && produtos.length > 0 ? (
                produtos.map((produto) => (
                  <SelectItem key={produto.id} value={produto.id}>
                    {produto.nome} - {formatarCurrency(produto.preco_unitario)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="empty" disabled>Nenhum produto encontrado</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quantidade</label>
          <Input 
            type="number" 
            value={quantidade} 
            onChange={(e) => setQuantidade(Number(e.target.value))} 
            min={1}
          />
        </div>

        {unidade === 'm²' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Largura (m)</label>
              <Input 
                type="number" 
                value={largura || 0.5} 
                onChange={(e) => setLargura(Number(e.target.value))} 
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Altura (m)</label>
              <Input 
                type="number" 
                value={altura || 0.5} 
                onChange={(e) => setAltura(Number(e.target.value))} 
                step="0.01"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end">
        <Button 
          type="button" 
          onClick={adicionarItem}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>
    </div>
  );
}
