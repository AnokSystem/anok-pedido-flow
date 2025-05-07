
import { Cliente, DashboardStats, Empresa, Pedido, Produto, StatusPedido, Usuario } from '@/types';

// Gerar IDs únicos
const generateId = () => Math.random().toString(36).substring(2, 9);

// Empresa exemplo
export const empresaMock: Empresa = {
  id: 'emp-1',
  nome_empresa: 'Gráfica Exemplo Ltda',
  cnpj: '12.345.678/0001-90',
  endereco: 'Rua das Impressões, 123 - Centro',
  contato: '(11) 98765-4321',
  email: 'contato@graficaexemplo.com',
  logo: '/placeholder.svg',
  pix: 'contato@graficaexemplo.com',
  criada_em: new Date().toISOString()
};

// Usuário exemplo
export const usuariosMock: Usuario[] = [
  {
    id: 'user-1',
    nome: 'Administrador',
    email: 'admin@graficaexemplo.com',
    empresa_id: 'emp-1',
    tipo_usuario: 'admin'
  },
  {
    id: 'user-2',
    nome: 'Vendedor',
    email: 'vendedor@graficaexemplo.com',
    empresa_id: 'emp-1',
    tipo_usuario: 'vendedor'
  }
];

// Clientes exemplo
export const clientesMock: Cliente[] = [
  {
    id: 'cli-1',
    empresa_id: 'emp-1',
    nome: 'Loja Comercial ABC',
    cpf_cnpj: '23.456.789/0001-12',
    rua: 'Avenida Comercial',
    numero: '456',
    bairro: 'Centro',
    cidade: 'São Paulo',
    contato: '(11) 3456-7890',
    email: 'contato@lojaabc.com',
    responsavel: 'João Silva',
    desconto_especial: 5
  },
  {
    id: 'cli-2',
    empresa_id: 'emp-1',
    nome: 'Papelaria XYZ',
    cpf_cnpj: '34.567.890/0001-23',
    rua: 'Rua dos Papéis',
    numero: '789',
    bairro: 'Jardim Paulista',
    cidade: 'São Paulo',
    contato: '(11) 4567-8901',
    email: 'contato@papelariaxy.com',
    responsavel: 'Maria Oliveira',
    desconto_especial: 10
  },
  {
    id: 'cli-3',
    empresa_id: 'emp-1',
    nome: 'Mercado Central',
    cpf_cnpj: '45.678.901/0001-34',
    rua: 'Avenida Central',
    numero: '101',
    bairro: 'Pinheiros',
    cidade: 'São Paulo',
    contato: '(11) 5678-9012',
    email: 'contato@mercadocentral.com',
    responsavel: 'Pedro Santos'
  }
];

// Produtos exemplo
export const produtosMock: Produto[] = [
  {
    id: 'prod-1',
    empresa_id: 'emp-1',
    nome: 'Banner Simples',
    unidade: 'm²',
    preco_unitario: 60.00,
    descricao: 'Banner em lona 440g com acabamento em ilhós'
  },
  {
    id: 'prod-2',
    empresa_id: 'emp-1',
    nome: 'Cartão de Visita',
    unidade: 'un',
    preco_unitario: 0.20,
    descricao: 'Cartão de visita 9x5cm em papel couchê 300g'
  },
  {
    id: 'prod-3',
    empresa_id: 'emp-1',
    nome: 'Adesivo Vinil',
    unidade: 'm²',
    preco_unitario: 75.00,
    descricao: 'Adesivo vinil com impressão digital'
  },
  {
    id: 'prod-4',
    empresa_id: 'emp-1',
    nome: 'Folder A5',
    unidade: 'un',
    preco_unitario: 0.80,
    descricao: 'Folder A5 em papel couchê 170g, 4x4 cores'
  },
  {
    id: 'prod-5',
    empresa_id: 'emp-1',
    nome: 'Faixa',
    unidade: 'm²',
    preco_unitario: 50.00,
    descricao: 'Faixa em lona 280g com acabamento em bastão'
  }
];

// Função para calcular valor total
const calcularValorTotal = (quantidade: number, valorUnit: number, largura?: number, altura?: number, unidade?: string) => {
  if (unidade === 'm²' && largura && altura) {
    return quantidade * valorUnit * largura * altura;
  }
  return quantidade * valorUnit;
};

// Pedidos exemplo
export const pedidosMock: Pedido[] = [
  {
    id: 'ped-1',
    numero_pedido: 'PD-001',
    cliente_id: 'cli-1',
    empresa_id: 'emp-1',
    data_emissao: new Date(2024, 3, 15).toISOString(),
    data_entrega: new Date(2024, 3, 20).toISOString(),
    total: 350.00,
    status: 'Entregue',
    payment_status: 'Pago',
    itens: [
      {
        id: 'item-1',
        pedido_id: 'ped-1',
        produto_id: 'prod-1',
        descricao: 'Banner para fachada',
        quantidade: 1,
        largura: 2,
        altura: 1.5,
        unidade: 'm²',
        valor_unit: 60.00,
        valor_total: 180.00,
        produto: produtosMock[0]
      },
      {
        id: 'item-2',
        pedido_id: 'ped-1',
        produto_id: 'prod-2',
        descricao: 'Cartões de visita',
        quantidade: 1000,
        unidade: 'un',
        valor_unit: 0.20,
        valor_total: 200.00,
        produto: produtosMock[1]
      }
    ],
    cliente: clientesMock[0]
  },
  {
    id: 'ped-2',
    numero_pedido: 'PD-002',
    cliente_id: 'cli-2',
    empresa_id: 'emp-1',
    data_emissao: new Date(2024, 3, 18).toISOString(),
    data_entrega: new Date(2024, 3, 25).toISOString(),
    total: 300.00,
    status: 'Em Produção',
    payment_status: 'Parcial',
    itens: [
      {
        id: 'item-3',
        pedido_id: 'ped-2',
        produto_id: 'prod-3',
        descricao: 'Adesivo para vitrine',
        quantidade: 1,
        largura: 4,
        altura: 1,
        unidade: 'm²',
        valor_unit: 75.00,
        valor_total: 300.00,
        produto: produtosMock[2]
      }
    ],
    cliente: clientesMock[1]
  },
  {
    id: 'ped-3',
    numero_pedido: 'PD-003',
    cliente_id: 'cli-3',
    empresa_id: 'emp-1',
    data_emissao: new Date(2024, 3, 20).toISOString(),
    data_entrega: new Date(2024, 3, 27).toISOString(),
    total: 400.00,
    status: 'Criado',
    payment_status: 'Pendente',
    itens: [
      {
        id: 'item-4',
        pedido_id: 'ped-3',
        produto_id: 'prod-4',
        descricao: 'Folders promocionais',
        quantidade: 500,
        unidade: 'un',
        valor_unit: 0.80,
        valor_total: 400.00,
        produto: produtosMock[3]
      }
    ],
    cliente: clientesMock[2]
  }
];

// Estatísticas para o dashboard
export const dashboardStatsMock: DashboardStats = {
  totalPedidos: pedidosMock.length,
  valorTotal: pedidosMock.reduce((acc, pedido) => acc + pedido.total, 0),
  totalClientes: clientesMock.length,
  totalProdutos: produtosMock.length,
  pedidosPorStatus: [
    { status: 'Criado', count: 1 },
    { status: 'Em Produção', count: 1 },
    { status: 'Pronto', count: 0 },
    { status: 'Entregue', count: 1 }
  ],
  pedidosPorMes: [
    { mes: 'Jan', valor: 0 },
    { mes: 'Fev', valor: 0 },
    { mes: 'Mar', valor: 0 },
    { mes: 'Abr', valor: 1050 },
    { mes: 'Mai', valor: 0 },
    { mes: 'Jun', valor: 0 },
    { mes: 'Jul', valor: 0 },
    { mes: 'Ago', valor: 0 },
    { mes: 'Set', valor: 0 },
    { mes: 'Out', valor: 0 },
    { mes: 'Nov', valor: 0 },
    { mes: 'Dez', valor: 0 }
  ],
  pedidosPorPagamento: [
    { status: 'Pendente', count: 1, valor: 400 },
    { status: 'Parcial', count: 1, valor: 300 },
    { status: 'Pago', count: 1, valor: 350 }
  ]
};

// Função para criar um novo pedido
export const criarNovoPedido = (
  cliente: Cliente,
  itens: {
    produto: Produto,
    quantidade: number,
    descricao: string,
    largura?: number,
    altura?: number
  }[]
): Pedido => {
  const pedidoId = `ped-${generateId()}`;
  const numeroPedido = `PD-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const itensPedido = itens.map((item, index) => {
    const valorTotal = calcularValorTotal(
      item.quantidade,
      item.produto.preco_unitario,
      item.largura,
      item.altura,
      item.produto.unidade
    );
    
    return {
      id: `item-${generateId()}`,
      pedido_id: pedidoId,
      produto_id: item.produto.id,
      descricao: item.descricao,
      quantidade: item.quantidade,
      largura: item.largura,
      altura: item.altura,
      unidade: item.produto.unidade,
      valor_unit: item.produto.preco_unitario,
      valor_total: valorTotal,
      produto: item.produto
    };
  });
  
  const total = itensPedido.reduce((acc, item) => acc + item.valor_total, 0);
  
  return {
    id: pedidoId,
    numero_pedido: numeroPedido,
    cliente_id: cliente.id,
    empresa_id: 'emp-1',
    data_emissao: new Date().toISOString(),
    data_entrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias depois
    total: total,
    status: 'Criado',
    payment_status: 'Pendente',
    itens: itensPedido,
    cliente: cliente
  };
};
