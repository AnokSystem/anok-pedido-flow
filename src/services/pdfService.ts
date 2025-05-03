
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Pedido, Empresa } from "@/types";
import { formatarCurrency, formatarData, formatarCpfCnpj } from "@/lib/utils";

export const generatePedidoPDF = (pedido: Pedido, empresa: Empresa | null) => {
  const doc = new jsPDF();
  
  // Set up for company info next to logo
  let startY = 15;
  let logoWidth = 0;
  
  // Add company logo if exists
  if (empresa?.logo) {
    try {
      // Add the logo to the left side
      logoWidth = 40;
      doc.addImage(empresa.logo, 'JPEG', 14, startY, logoWidth, 20);
    } catch (e) {
      console.error('Erro ao adicionar logo:', e);
    }
  }
  
  // Add company info next to logo
  doc.setFontSize(10);
  if (empresa) {
    // Position company info to the right of the logo
    const infoX = logoWidth > 0 ? 60 : 14; // If logo exists, start text after logo
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`${empresa.nome_empresa}`, infoX, startY + 5);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    let currentY = startY + 10;
    if (empresa.cnpj) {
      doc.text(`CNPJ: ${formatarCpfCnpj(empresa.cnpj)}`, infoX, currentY);
      currentY += 5;
    }
    if (empresa.endereco) {
      doc.text(`Endereço: ${empresa.endereco}`, infoX, currentY);
      currentY += 5;
    }
    if (empresa.contato) {
      doc.text(`Contato: ${empresa.contato}`, infoX, currentY);
      currentY += 5;
    }
    if (empresa.email) {
      doc.text(`Email: ${empresa.email}`, infoX, currentY);
      currentY += 5;
    }
    
    startY = Math.max(startY + 25, currentY + 5); // Update startY to be below both logo and company info
  }
  
  // Add a divider line after company info
  doc.setDrawColor(200, 200, 200);
  doc.line(14, startY, 196, startY);
  startY += 8;
  
  // Add title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(`PEDIDO: ${pedido.numero_pedido}`, 14, startY);
  doc.setFont(undefined, 'normal');
  startY += 10;
  
  // Add customer info
  doc.setFontSize(11);
  doc.text(`Cliente: ${pedido.cliente?.nome || 'N/A'}`, 14, startY);
  startY += 5;
  
  if (pedido.cliente?.cpf_cnpj) {
    doc.text(`CPF/CNPJ: ${formatarCpfCnpj(pedido.cliente.cpf_cnpj)}`, 14, startY);
    startY += 5;
  }
  if (pedido.cliente?.contato) {
    doc.text(`Contato: ${pedido.cliente.contato}`, 14, startY);
    startY += 5;
  }
  if (pedido.cliente?.email) {
    doc.text(`Email: ${pedido.cliente.email}`, 14, startY);
    startY += 5;
  }
  
  // Add a divider line after customer info
  doc.setDrawColor(200, 200, 200);
  doc.line(14, startY + 3, 196, startY + 3);
  startY += 8;
  
  // Add order info
  doc.text(`Data de Emissão: ${formatarData(pedido.data_emissao)}`, 14, startY);
  startY += 5;
  
  if (pedido.data_entrega) {
    doc.text(`Data de Entrega: ${formatarData(pedido.data_entrega)}`, 14, startY);
    startY += 5;
  }
  
  doc.text(`Status: ${pedido.status}`, 14, startY);
  startY += 10;
  
  // Add description if exists
  if (pedido.descricao) {
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Descrição:', 14, startY);
    doc.setFont(undefined, 'normal');
    startY += 5;
    
    const splitDescription = doc.splitTextToSize(pedido.descricao, 180);
    doc.text(splitDescription, 14, startY);
    startY += splitDescription.length * 5 + 5;
  }
  
  // Add a divider line before items table
  doc.setDrawColor(200, 200, 200);
  doc.line(14, startY, 196, startY);
  startY += 8;
  
  // Verificar se algum item tem dimensões e é m²
  const showDimensoes = pedido.itens.some(item => item.unidade === 'm²' && item.largura && item.altura);
  
  // Definir colunas com base na necessidade de mostrar dimensões
  const tableColumn = showDimensoes 
    ? ["Item", "Qtd", "Un", "Dimensões", "Valor/Un", "Total"]
    : ["Item", "Qtd", "Un", "Valor/Un", "Total"];
  
  const tableRows = pedido.itens.map(item => {
    // Usar a descrição do item como informação principal
    const descricao = item.descricao || (item.produto?.nome || 'N/A');
    
    // Valor por unidade (considerando área para itens m²)
    let valorPorUnidade = item.valor_unit;
    if (item.unidade === 'm²' && item.largura && item.altura) {
      valorPorUnidade = item.valor_unit * item.largura * item.altura;
    }
    
    // Criar linha com ou sem dimensões dependendo do tipo de produto
    if (showDimensoes) {
      const dimensoes = item.unidade === 'm²' && item.largura && item.altura
        ? `${item.largura}m × ${item.altura}m`
        : '-';
      
      return [
        descricao,
        item.quantidade.toString(),
        item.unidade,
        dimensoes,
        formatarCurrency(valorPorUnidade),
        formatarCurrency(item.valor_total)
      ];
    } else {
      return [
        descricao,
        item.quantidade.toString(),
        item.unidade,
        formatarCurrency(valorPorUnidade),
        formatarCurrency(item.valor_total)
      ];
    }
  });
  
  // Use autoTable properly
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: startY,
    theme: 'grid',
    styles: { fontSize: 9 },
    columnStyles: showDimensoes
      ? {
          0: { cellWidth: 50 }, // Coluna de descrição
          3: { cellWidth: 25 }, // Coluna de dimensões
          4: { cellWidth: 20 }, // Coluna de valor por unidade
        }
      : {
          0: { cellWidth: 50 }, // Coluna de descrição
          3: { cellWidth: 20 }, // Coluna de valor por unidade
        },
  });
  
  // Add total
  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  doc.setFontSize(12);
  doc.text(`Total do Pedido: ${formatarCurrency(pedido.total)}`, 130, finalY + 10);
  
  // Add a divider line before signatures
  doc.setDrawColor(200, 200, 200);
  doc.line(14, finalY + 25, 196, finalY + 25);
  
  // Add signature fields
  doc.setFontSize(10);
  doc.text("_________________________________", 30, finalY + 40);
  doc.text("Assinatura do Vendedor", 40, finalY + 45);
  
  doc.text("_________________________________", 130, finalY + 40);
  doc.text("Assinatura do Cliente", 140, finalY + 45);
  
  // Add footer with company contact
  doc.setFontSize(9);
  const pageHeight = doc.internal.pageSize.height;
  if (empresa) {
    const footerText = [
      empresa.nome_empresa,
      empresa.contato ? `Tel: ${empresa.contato}` : '',
      empresa.email ? `Email: ${empresa.email}` : '',
      empresa.cnpj ? `CNPJ: ${formatarCpfCnpj(empresa.cnpj)}` : ''
    ].filter(Boolean).join(' - ');
    
    doc.text(footerText, 14, pageHeight - 10, { maxWidth: 180 });
  }
  
  return doc;
};
