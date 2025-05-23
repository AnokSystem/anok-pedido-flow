
export type Usuario = {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  empresa_id: string;
  tipo_usuario: 'admin' | 'vendedor' | 'visualizador';
  permissoes?: string[];
};

export type Empresa = {
  id: string;
  nome_empresa: string;
  cnpj: string;
  endereco: string;
  contato: string;
  email: string;
  logo?: string;
  pix?: string;
  criada_em: string;
};

export type Cliente = {
  id: string;
  empresa_id: string;
  nome: string;
  cpf_cnpj: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  contato: string;
  email: string;
  responsavel?: string;
  desconto_especial?: number;
};

export type Produto = {
  id: string;
  empresa_id: string | null;
  nome: string;
  unidade: 'un' | 'm²' | 'kg' | 'l' | 'caixa';
  preco_unitario: number;
  descricao?: string;
};

export type StatusPedido = 'Criado' | 'Em Produção' | 'Pronto' | 'Entregue';
export type PaymentStatus = 'Pago' | 'Pendente' | 'Parcial';

export interface Pedido {
  id: string;
  numero_pedido: string;
  cliente_id: string;
  data_emissao: string;
  data_entrega?: string;
  total: number;
  status: string;
  payment_status: PaymentStatus;
  cliente?: Cliente;
  itens: ItemPedido[];
  descricao?: string;
  empresa_id?: string;
}

export type ItemPedido = {
  id: string;
  pedido_id: string;
  produto_id: string;
  descricao: string;
  quantidade: number;
  largura?: number;
  altura?: number;
  unidade: 'un' | 'm²' | 'kg' | 'l' | 'caixa';
  valor_unit: number;
  valor_total: number;
  produto?: Produto;
};

export type Log = {
  id: string;
  tipo: 'edição' | 'criação' | 'exclusão';
  entidade: 'pedido' | 'cliente' | 'produto';
  usuario_id: string;
  data: string;
  descricao: string;
};

export type Webhook = {
  id: string;
  empresa_id: string;
  url_destino: string;
  ativado: boolean;
  campos_selecionados: string[];
};

export type DashboardStats = {
  totalPedidos: number;
  valorTotal: number;
  totalClientes: number;
  totalProdutos: number;
  pedidosPorStatus: {
    status: StatusPedido;
    count: number;
  }[];
  pedidosPorMes: {
    mes: string;
    valor: number;
  }[];
  pedidosPorPagamento?: {
    status: PaymentStatus;
    count: number;
    valor: number;
  }[];
}
