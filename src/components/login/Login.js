"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { FiEdit, FiLogOut, FiLogIn } from "react-icons/fi";
import { useRouter } from "next/navigation";

const Login = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [imageSrc, setImageSrc] = useState("/img/user/default-user.png");
  const [isHovered, setIsHovered] = useState(false);

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
  };

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Image
          className={
            "border-t-2 rounded-full border-r-2 border-l-2 border-green-800"
          }
          src={imageSrc}
          alt="User"
          width={64}
          height={64}
        />
      </div>
      <></>

      {isHovered && (
        <div
          className="bg-primary-light absolute right-0 top-[calc(100%-1px)] w-56 shadow-2xl bg-white border-2 border-green-800"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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
