"use client";

import { useHeader } from "@/contexts/HeaderContext";
import { useSidebar } from "@/contexts/SidebarContext";
import React from "react";

const Header = () => {
  const { headerConfig } = useHeader();
  const { title, subtitle, icon: Icon } = headerConfig;
  const { openSliderBar, openSideBar } = useSidebar();
  return (
    <header
      className={`flex flex-col p-6 border-b border-r ${!openSideBar && "border-t"} ${!Icon && "hidden"} border-light-border dark:border-dark-border bg-light-background-form-secondary dark:bg-dark-background-form-secondary transition-all duration-300`}
      style={{
        // Sobrescreve em mobile com media query ou lógica condicional
        ...(typeof window !== "undefined" &&
          window.innerWidth < 768 && {
            marginLeft: openSliderBar ? "0" : "", // Remove o margin em mobile
          }),
      }}
    >
      <h1 className="text-2xl font-bold flex items-center gap-2 text-light-text dark:text-dark-text">
        {Icon && <Icon className="w-6 h-6" />} {title}
      </h1>
      <p className="text-sm text-light-muted dark:text-dark-muted">
        {subtitle}
      </p>
    </header>
  );
};

export default Header;
