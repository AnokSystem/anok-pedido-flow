
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <h1 className="text-8xl font-bold text-anok-500">404</h1>
        <h2 className="text-2xl font-semibold mt-4 mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-6">
          Não conseguimos encontrar a página que você está procurando.
        </p>
        <Button asChild>
          <Link to="/">Voltar para o início</Link>
        </Button>
      </div>
    </div>
  );
}
