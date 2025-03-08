"use client";
import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [openSliderBar, setOpenSliderBar] = useState(null);
  const [openSideBar, setOpenSideBar] = useState(false); // Novo estado

  return (
    <SidebarContext.Provider
      value={{ openSliderBar, setOpenSliderBar, openSideBar, setOpenSideBar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
