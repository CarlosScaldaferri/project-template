// src/app/dashboard/page.js
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  if (status === "authenticated") {
    return (
      <div>
        <h1>Bem-vindo, {session.user.name || session.user.email}!</h1>
        <p>ID do usuário: {session.user.id}</p>
        <p>Nickname: {session.user.nickname}</p>
      </div>
    );
  }

  return null; // Será redirecionado para /login
}
