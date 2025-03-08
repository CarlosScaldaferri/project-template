"use client";
import { createContext, useContext, useState } from "react";

const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
  const [headerConfig, setHeaderConfig] = useState({
    title: "Título Padrão",
    subtitle: "Subtítulo Padrão",
    icon: null,
  });

  return (
    <HeaderContext.Provider value={{ headerConfig, setHeaderConfig }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  return useContext(HeaderContext);
};
