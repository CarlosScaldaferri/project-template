// src/app/users/[id]/page.jsx
import UserForm from "@/frontend/components/user/form/UserForm";
import { notFound } from "next/navigation";

export default async function UserPage({ params }) {
  // Aguarda a resolução dos parâmetros antes de acessá-los
  const resolvedParams = await params;

  if (!resolvedParams || typeof resolvedParams !== "object") {
    console.error(
      "Erro: `params` não está definido ou é inválido",
      resolvedParams
    );
    notFound();
  }

  const id = resolvedParams.id;

  if (!id) {
    console.error("Erro: `params.id` não está definido", resolvedParams);
    notFound();
  }

  return <UserForm userId={id} />;
}
