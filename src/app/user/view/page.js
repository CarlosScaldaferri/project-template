"use client";
import UserForm from "@/frontend/components/user/form/UserForm"; // Ajuste o caminho se necessário
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // Necessário para useSearchParams no App Router

// Componente interno para usar hooks que requerem Suspense
function ViewUserContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const mode = "view"; // Modo fixo para esta página

  // *** CHAVE DA SOLUÇÃO B: Construir a key dinâmica ***
  const componentKey = `user-form-${mode}-${userId || "no-id"}`; // Fallback 'no-id'

  console.log(
    `Rendering UserForm in ViewPage - UserID: ${userId}, Mode: ${mode}, ComponentKey: ${componentKey}`
  );

  // Validação Essencial: Modo 'view' PRECISA de um userId.
  if (!userId) {
    console.error("ViewPage Error: userId parameter is missing for view mode.");
    // Retorne uma UI de erro apropriada.
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">Erro</h2>
          <p>
            O ID do usuário é necessário para acessar a página de visualização.
          </p>
        </div>
      </div>
    );
  }

  // Renderiza o UserForm passando a key dinâmica e as props necessárias
  return (
    <UserForm
      // *** CHAVE DA SOLUÇÃO B: Aplicar a key ***
      key={componentKey}
      userId={userId}
      initialMode={mode} // Informa ao UserForm como ele deve se inicializar
    />
  );
}

// Componente principal da página de visualização
export default function ViewPage() {
  // Envolver com Suspense
  return (
    <div>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen">
            <div className="p-6">Carregando dados do usuário...</div>
          </div>
        }
      >
        <ViewUserContent />
      </Suspense>
    </div>
  );
}
