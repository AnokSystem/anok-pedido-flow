
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Produto } from "@/types";
import { formatarCurrency } from "@/lib/utils";

interface PedidoItemFormProps {
  produtosLoading: boolean;
  produtos?: Produto[];
  produtoSelecionado: string;
  quantidade: number;
  largura?: number;
  altura?: number;
  unidade: string;
  handleProdutoChange: (produtoId: string) => void;
  setQuantidade: (quantidade: number) => void;
  setLargura: (largura: number | undefined) => void;
  setAltura: (altura: number | undefined) => void;
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
  handleProdutoChange,
  setQuantidade,
  setLargura,
  setAltura,
  adicionarItem,
}: PedidoItemFormProps) {
  return (
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
              value={largura || ''} 
              onChange={(e) => setLargura(Number(e.target.value))} 
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Altura (m)</label>
            <Input 
              type="number" 
              value={altura || ''} 
              onChange={(e) => setAltura(Number(e.target.value))} 
              step="0.01"
            />
          </div>
        </>
      )}

      <div className="flex items-end">
        <Button 
          type="button" 
          onClick={adicionarItem} 
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>
    </div>
  );
}
