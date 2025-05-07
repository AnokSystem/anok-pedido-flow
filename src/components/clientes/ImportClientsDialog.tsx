
import { useState } from "react";
import { parseCSVToClientes } from "@/lib/csvUtils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Cliente } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileUp, Upload } from "lucide-react";

interface ImportClientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (clientes: Omit<Cliente, 'id'>[]) => void;
  isLoading: boolean;
}

export function ImportClientsDialog({ 
  open, 
  onOpenChange, 
  onImport, 
  isLoading 
}: ImportClientsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Omit<Cliente, 'id'>[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      setPreview([]);
      return;
    }
    
    const selectedFile = e.target.files[0];
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Por favor, selecione um arquivo CSV válido.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    
    // Read file and preview
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const importedClientes = parseCSVToClientes(csvText);
        setPreview(importedClientes.slice(0, 3)); // Preview first 3 entries
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao processar arquivo CSV');
        setPreview([]);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo CSV para importar.');
      return;
    }
    
    try {
      setError(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvText = event.target?.result as string;
          const importedClientes = parseCSVToClientes(csvText);
          onImport(importedClientes);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao processar arquivo CSV');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo CSV');
    }
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setPreview([]);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Clientes</DialogTitle>
          <DialogDescription>
            Carregue um arquivo CSV com os dados dos clientes para importação em massa.
            <br />
            O arquivo deve conter pelo menos as colunas 'nome' e 'cpf_cnpj'.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="csv-file" className="text-sm font-medium">
              Arquivo CSV
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isLoading}
                className="flex-1"
              />
              {file && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={isLoading}
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && (
            <div className="mt-2">
              <h4 className="font-medium text-sm mb-2">
                Pré-visualização ({preview.length} de {preview.length === 3 ? '3+' : preview.length} registros):
              </h4>
              <div className="bg-muted rounded-md p-2 text-sm overflow-auto max-h-32">
                <ul className="space-y-1">
                  {preview.map((cliente, idx) => (
                    <li key={idx}>
                      {cliente.nome} - {cliente.cpf_cnpj || 'Sem CPF/CNPJ'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between flex flex-row">
          <div className="text-xs text-muted-foreground">
            <FileUp className="h-3 w-3 inline mr-1" />
            Tamanho máximo: 5MB
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <span>Importando...</span>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  <span>Importar</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
