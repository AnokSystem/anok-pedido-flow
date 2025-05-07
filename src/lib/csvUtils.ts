import { Cliente } from "@/types";
import * as XLSX from 'xlsx';

// Define the column headers for cliente Excel
const EXCEL_HEADERS = [
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

// Helper to validate headers
export const validateHeaders = (headers: string[]): boolean => {
  const requiredHeaders = ['nome', 'cpf_cnpj']; // Minimum required fields
  return requiredHeaders.every(header => headers.includes(header));
};

// Export clientes to Excel
export const exportClientesToExcel = (clientes: Cliente[]): Blob => {
  if (!clientes || clientes.length === 0) throw new Error('No clients to export');

  // Create a workbook
  const wb = XLSX.utils.book_new();
  
  // Create data array with headers first
  const excelData = [EXCEL_HEADERS];
  
  // Add client data rows
  for (const cliente of clientes) {
    const values = EXCEL_HEADERS.map(header => {
      const value = cliente[header as keyof Cliente];
      return value !== null && value !== undefined ? value : '';
    });
    excelData.push(values);
  }
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Parse Excel to cliente objects
export const parseExcelToClientes = (file: File): Promise<Omit<Cliente, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error('O arquivo Excel deve conter pelo menos um cabeçalho e uma linha de dados');
        }
        
        // Get headers (first row)
        const headers = (jsonData[0] as string[]).map(h => String(h).trim().toLowerCase());
        
        if (!validateHeaders(headers)) {
          throw new Error('O arquivo Excel deve conter pelo menos os campos obrigatórios: nome, cpf_cnpj');
        }
        
        const clientes: Omit<Cliente, 'id'>[] = [];
        
        // Parse data rows (skip header)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;
          
          const cliente: Record<string, any> = { empresa_id: null }; // Will be assigned server-side
          
          headers.forEach((header, index) => {
            if (EXCEL_HEADERS.includes(header) && index < row.length) {
              let value = row[index];
              
              // Handle special types
              if (header === 'desconto_especial' && value !== undefined && value !== '') {
                const numValue = Number(value);
                cliente[header] = isNaN(numValue) ? null : numValue;
              } else {
                cliente[header] = value !== undefined && value !== null ? String(value).trim() : null;
              }
            }
          });
          
          clientes.push(cliente as Omit<Cliente, 'id'>);
        }
        
        resolve(clientes);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Downloads the Excel file in the browser
export const downloadExcel = (excelBlob: Blob, filename: string): void => {
  const link = document.createElement('a');
  
  // Create a downloadable link
  const url = URL.createObjectURL(excelBlob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
      if (EXCEL_HEADERS.includes(header)) {
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

// Export the legacy CSV functions
export const exportClientesToCSV = exportClientesToCSV;
export const downloadCSV = downloadCSV;
