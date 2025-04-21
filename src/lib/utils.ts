
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarData(dataString: string): string {
  const data = new Date(dataString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data);
}

export function formatarCurrency(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function formatarCpfCnpj(documento: string): string {
  if (documento.length === 11) {
    return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (documento.length === 14) {
    return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return documento;
}

export function calcularAreaTotal(largura?: number, altura?: number): number {
  if (!largura || !altura) return 0;
  return largura * altura;
}

export function calcularValorItem(
  quantidade: number,
  valorUnitario: number,
  unidade: string,
  largura?: number,
  altura?: number
): number {
  if (unidade === 'm²' && largura && altura) {
    return quantidade * valorUnitario * largura * altura;
  }
  return quantidade * valorUnitario;
}

export function calcularTotalPedido(
  itens: Array<{
    valor_total: number;
  }>,
  descontoPercentual: number = 0
): number {
  const subtotal = itens.reduce((acc, item) => acc + item.valor_total, 0);
  const desconto = subtotal * (descontoPercentual / 100);
  return subtotal - desconto;
}

export function gerarNumeroSequencial(prefix: string, number: number): string {
  return `${prefix}-${number.toString().padStart(4, '0')}`;
}
