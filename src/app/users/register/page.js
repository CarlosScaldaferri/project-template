"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovoUsuarioPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Chamar API para adicionar usuário
    router.push("/user");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Novo Usuário</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
          className="p-2 border rounded"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
