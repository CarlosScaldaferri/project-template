"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { FiEdit, FiLogOut, FiLogIn, FiChevronDown } from "react-icons/fi";
import { useRouter } from "next/navigation";

const Login = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState("/img/user/default-user.png");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user?.picture) {
      setImageSrc(user.picture);
    } else {
      setImageSrc("/img/user/default-user.png");
    }
  }, [user]);

  const handleUserEdit = async () => {
    if (user) {
      router.push(`/users`);
    } else {
      console.error("Usuário não encontrado.");
    }
    setIsOpen(false); // Fecha o menu após clicar
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex relative cursor-pointer">
      <div className="flex flex-col items-center" onClick={toggleMenu}>
        <Image
          className="rounded-full border border-spacing-1 border-primary-dark"
          src={imageSrc}
          alt="User"
          width={24}
          height={24}
        />
        <FiChevronDown />
      </div>

      {isOpen && (
        <div
          className="bg-primary-light absolute right-0 top-[calc(100%-1px)] w-56 shadow-2xl bg-white border-2 border-green-800"
          onMouseLeave={() => setIsOpen(false)} // Fecha ao sair com o mouse (opcional)
        >
          <div className="py-2">
            {user ? (
              <>
                <a
                  href="#"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                  onClick={handleUserEdit}
                >
                  <FiEdit className="mr-2" />
                  Editar perfil
                </a>
                <a
                  href="/api/auth/logout"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                >
                  <FiLogOut className="mr-2" />
                  Sair
                </a>
              </>
            ) : (
              <a
                href="/api/auth/login"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
              >
                <FiLogIn className="mr-2" />
                Entrar
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
