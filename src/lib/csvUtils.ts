
import { Cliente } from "@/types";

// Define the column headers for cliente CSV
const CSV_HEADERS = [
  'nome',
  'cpf_cnpj',
  'rua',
  'numero',
  'bairro',
  'cidade',
  'contato',
  'email',
  'responsavel',
  'desconto_especial'
];

// Helper to validate CSV headers
export const validateHeaders = (headers: string[]): boolean => {
  const requiredHeaders = ['nome', 'cpf_cnpj']; // Minimum required fields
  return requiredHeaders.every(header => headers.includes(header));
};

// Export clientes to CSV
export const exportClientesToCSV = (clientes: Cliente[]): string => {
  if (!clientes || clientes.length === 0) return '';

  const csvRows = [];
  
  // Add headers
  csvRows.push(CSV_HEADERS.join(','));
  
  // Add data rows
  for (const cliente of clientes) {
    const values = CSV_HEADERS.map(header => {
      const value = cliente[header as keyof Cliente];
      // Format the value properly for CSV
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      return String(value);
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

// Parse CSV text to cliente objects
export const parseCSVToClientes = (csvText: string): Omit<Cliente, 'id'>[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('O arquivo CSV deve conter pelo menos um cabeçalho e uma linha de dados');
  }
  
  // Parse headers (first line)
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  if (!validateHeaders(headers)) {
    throw new Error('O arquivo CSV deve conter pelo menos os campos obrigatórios: nome, cpf_cnpj');
  }
  
  const clientes: Omit<Cliente, 'id'>[] = [];
  
  // Parse data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length !== headers.length) {
      console.warn(`Linha ${i+1} tem ${values.length} valores, mas são esperados ${headers.length}`);
      continue;
    }
    
    const cliente: Record<string, any> = { empresa_id: null }; // Will be assigned server-side
    
    headers.forEach((header, index) => {
      if (CSV_HEADERS.includes(header)) {
        let value = values[index].trim();
        
        // Handle special types
        if (header === 'desconto_especial' && value) {
          const numValue = Number(value);
          cliente[header] = isNaN(numValue) ? null : numValue;
        } else {
          cliente[header] = value || null;
        }
      }
    });
    
    clientes.push(cliente as Omit<Cliente, 'id'>);
  }
  
  return clientes;
};

// Helper function to parse a CSV line respecting quotes
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        // Double quotes inside quoted field
        currentValue += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of value
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add the last value
  values.push(currentValue);
  
  return values;
}

// Downloads the CSV file in the browser
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create a downloadable link
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
