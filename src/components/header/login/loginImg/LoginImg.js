"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const LoginImg = ({ user }) => {
  const [imageSrc, setImageSrc] = useState("/img/user/default-user.png");
  const [rounded, setRounded] = useState("rouded-full");

  useEffect(() => {
    if (user?.picture) {
      // Se o usuário tem uma imagem (picture), exibe a imagem do usuário
      setImageSrc(user.picture);
      setRounded("rounded-full");
    } else {
      // Se não tiver user.picture, exibe a imagem padrão
      setImageSrc("/img/user/default-user.png");
      setRounded("rounded-none");
    }
  }, [user]); // Reage às mudanças em isLoading e user

  return (
    <Image
      className={rounded}
      src={imageSrc}
      alt="User"
      width={40}
      height={40}
    />
  );
};

export default LoginImg;
