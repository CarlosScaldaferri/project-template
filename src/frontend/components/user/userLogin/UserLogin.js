"use client";

import { useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { FiEdit, FiLogOut, FiUser, FiBell } from "react-icons/fi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/**
 * Componente de login do usuário exibido no cabeçalho
 * @returns {JSX.Element|null} Componente de login do usuário ou null se não houver sessão
 */
export default function UserLogin() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /**
   * Manipula os cliques no menu do usuário
   * @param {string} action - Ação a ser executada (edit_profile, notifications, logout)
   * @returns {Promise<void>}
   */
  const handleMenuClick = useCallback(
    async (action) => {
      try {
        setIsLoading(true);

        switch (action) {
          case "edit_profile":
            if (!session?.user?.id) {
              throw new Error("ID do usuário não disponível");
            }

            await router.push(`user/edit?userId=${session.user.id}`);
            break;

          case "notifications":
            // Implementação futura
            console.log("Notificações clicado");
            break;

          case "logout":
            await signOut({
              redirect: false,
              callbackUrl: "/",
            });
            break;

          default:
            break;
        }
      } catch (error) {
        // Tratamento de erro centralizado
        const errorMessage = error.message || "Erro ao processar ação";
        console.error(`Erro em UserLogin (${action}):`, errorMessage);

        // Notifica o usuário sobre o erro
        toast.error(`Falha na operação: ${errorMessage}`);
      } finally {
        setIsLoading(false);
        setIsOpen(false);
      }
    },
    [session, router]
  );

  // Se não houver sessão, não renderiza nada
  if (!session?.user) return null;

  return (
    <div className="relative p-4 flex items-center gap-3 ">
      {/* Botão de Notificações com círculo */}
      <button
        onClick={() => handleMenuClick("notifications")}
        className="relative flex items-center justify-center w-8 h-8 rounded-full bg-light-background-sidebar dark:bg-dark-background-sidebar hover:bg-light-muted dark:hover:bg-dark-muted border border-light-primary-dark dark:border-dark-primary-dark"
      >
        <FiBell size={20} className=" text-light-icon dark:text-dark-icon" />
      </button>

      {/* Botão do Usuário sem seta */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center focus:outline-none"
        >
          {session.user.picture ? (
            <Image
              className="rounded-full border border-light-primary-dark dark:border-dark-primary-dark"
              src={`${process.env.NEXT_PUBLIC_UPLOADS}/${session.user.picture}`}
              alt={session.user.name || "Usuário"}
              width={32}
              height={32}
              onError={(e) => {
                // Em caso de erro ao carregar a imagem, exibe o ícone de usuário
                console.warn(
                  "Erro ao carregar imagem do usuário:",
                  session.user.picture
                );
                e.target.style.display = "none";
                // Adiciona um elemento de fallback
                const parent = e.target.parentNode;
                if (parent && !parent.querySelector("svg")) {
                  const fallbackIcon = document.createElement("div");
                  fallbackIcon.innerHTML =
                    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-light-icon dark:text-dark-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                  parent.appendChild(fallbackIcon.firstChild);
                }
              }}
            />
          ) : (
            <FiUser size={32} className="text-light-icon dark:text-dark-icon" />
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-light-background dark:bg-dark-background shadow-lg rounded-md z-50 border border-light-border dark:border-dark-border">
            <ul className="py-1">
              <li>
                <button
                  onClick={() => handleMenuClick("edit_profile")}
                  className="flex items-center w-full px-4 py-2 text-left text-light-text dark:text-dark-text hover:bg-light-background-sidebar dark:hover:bg-dark-background-sidebar"
                >
                  <FiEdit className="mr-2 text-light-icon dark:text-dark-icon" />
                  Editar perfil
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleMenuClick("logout")}
                  className="flex items-center w-full px-4 py-2 text-left text-light-text dark:text-dark-text hover:bg-light-background-sidebar dark:hover:bg-dark-background-sidebar"
                >
                  <FiLogOut className="mr-2 text-light-icon dark:text-dark-icon" />
                  Sair
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
