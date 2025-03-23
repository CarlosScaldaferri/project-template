"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

// Função auxiliar para gerenciar a pilha de URLs no localStorage
const manageUrlStack = (action, url = null) => {
  let stack = JSON.parse(localStorage.getItem("urlStack")) || [];

  if (action === "push" && url) {
    // Evita duplicatas consecutivas
    if (stack[stack.length - 1] !== url) {
      stack.push(url);
      localStorage.setItem("urlStack", JSON.stringify(stack));
    }
  } else if (action === "pop") {
    stack.pop(); // Remove a URL atual
    localStorage.setItem("urlStack", JSON.stringify(stack));
    return stack.length > 0 ? stack[stack.length - 1] : "/"; // Retorna a anterior ou "/"
  }
  return stack.length > 0 ? stack[stack.length - 1] : "/"; // Retorna a última URL ou "/"
};

// Hook personalizado
export default function useNavigationStack() {
  const router = useRouter();

  // Adiciona a URL de origem à pilha ao carregar a página
  const pushToStack = useCallback(() => {
    const currentUrl = window.location.pathname;
    const referrer = document.referrer || "/";
    if (referrer !== currentUrl) {
      manageUrlStack("push", referrer);
    }
  }, []);

  // Volta para a URL anterior na pilha
  const goBack = useCallback(() => {
    const previousUrl = manageUrlStack("pop");
    router.push(previousUrl);
  }, [router]);

  // Retorna o estado atual da pilha (opcional, para inspeção)
  const getStack = useCallback(() => {
    return JSON.parse(localStorage.getItem("urlStack")) || [];
  }, []);

  // Executa o pushToStack automaticamente ao montar o componente
  useEffect(() => {
    pushToStack();
  }, [pushToStack]);

  return { goBack, getStack };
}
