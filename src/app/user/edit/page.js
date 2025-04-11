"use client";
import UserForm from "@/frontend/components/user/form/UserForm"; // Ajuste o caminho se necessário
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // Necessário para useSearchParams no App Router

// Componente interno para usar hooks que requerem Suspense
function EditUserContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const mode = "edit"; // Modo fixo para esta página

  // *** CHAVE DA SOLUÇÃO B: Construir a key dinâmica ***
  // A key muda sempre que o userId muda, forçando a remontagem do UserForm.
  const componentKey = `user-form-${mode}-${userId || "no-id"}`; // Fallback 'no-id' caso userId seja nulo

  console.log(
    `Rendering UserForm in EditPage - UserID: ${userId}, Mode: ${mode}, ComponentKey: ${componentKey}`
  );

  // Validação Essencial: Modo 'edit' PRECISA de um userId.
  if (!userId) {
    console.error("EditPage Error: userId parameter is missing for edit mode.");
    // Retorne uma UI de erro apropriada. Não renderize o UserForm.
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">Erro</h2>
          <p>O ID do usuário é necessário para acessar a página de edição.</p>
          {/* Opcional: Adicionar link para voltar ou pesquisar */}
          {/* <Link href="/user/search">Voltar para pesquisa</Link> */}
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

// Componente principal da página de edição
export default function EditPage() {
  // Envolver com Suspense é obrigatório ao usar useSearchParams no App Router
  return (
    <div>
      <Suspense
        fallback={
          // Pode mostrar um spinner ou layout skeleton aqui
          <div className="flex justify-center items-center h-screen">
            <div className="p-6">Carregando formulário de edição...</div>
          </div>
        }
      >
        <EditUserContent />
      </Suspense>
    </div>
  );
}
