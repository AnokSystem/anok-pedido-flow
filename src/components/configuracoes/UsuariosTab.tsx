
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Usuario } from "@/types";
import { UsuarioForm } from "./UsuarioForm";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
};

function Badge({ children, variant = "default", className }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-input bg-background"
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className || ""}`}>
      {children}
    </span>
  );
}

export function UsuariosTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null);
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome');

      if (error) throw error;

      setUsuarios(data as Usuario[]);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUsuario = () => {
    setCurrentUsuario(null);
    setFormOpen(true);
  };

  const handleEditUsuario = (usuario: Usuario) => {
    setCurrentUsuario(usuario);
    setFormOpen(true);
  };

  const handleDeleteUsuario = (usuario: Usuario) => {
    setUsuarioToDelete(usuario);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!usuarioToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', usuarioToDelete.id);

      if (error) throw error;

      setUsuarios(prev => prev.filter(u => u.id !== usuarioToDelete.id));
      toast({
        title: "Usuário removido",
        description: `${usuarioToDelete.nome} foi removido com sucesso.`,
      });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Erro ao remover usuário:', error);
      toast({
        title: "Erro ao remover usuário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = (usuario: Usuario, isNew: boolean) => {
    if (isNew) {
      setUsuarios(prev => [...prev, usuario]);
    } else {
      setUsuarios(prev => prev.map(u => u.id === usuario.id ? usuario : u));
    }
    setFormOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Adicione e gerencie usuários que têm acesso ao sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Usuários do Sistema</h3>
            <Button onClick={handleAddUsuario} size="sm" className="h-8">
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário cadastrado. Clique em "Adicionar Usuário" para começar.
            </div>
          ) : (
            <div className="rounded-md border">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="p-4 flex justify-between items-center border-b last:border-0">
                  <div>
                    <p className="font-medium">{usuario.nome}</p>
                    <p className="text-sm text-muted-foreground">{usuario.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={usuario.tipo_usuario === 'admin' ? 'default' : 'outline'}>
                      {usuario.tipo_usuario === 'admin' ? 'Administrador' : 
                       usuario.tipo_usuario === 'vendedor' ? 'Vendedor' : 'Visualizador'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditUsuario(usuario)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUsuario(usuario)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Formulário de usuário */}
      <UsuarioForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        usuario={currentUsuario} 
        onSuccess={handleFormSuccess}
      />

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remover Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {usuarioToDelete && (
              <p className="font-medium">
                {usuarioToDelete.nome} ({usuarioToDelete.email})
              </p>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                "Remover"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
