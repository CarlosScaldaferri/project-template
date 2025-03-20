"use client";

import { useHeader } from "@/contexts/HeaderContext";
import { useSidebar } from "@/contexts/SidebarContext";
import React from "react";
import { RiMessage2Line } from "react-icons/ri";

const Header = () => {
  const { headerConfig } = useHeader();
  const { title, subtitle, icon: Icon } = headerConfig;
  const { openSliderBar, openSideBar } = useSidebar();

  return (
    <header
      className={`flex flex-col p-6 border-b border-r ${
        !openSideBar && "border-t"
      } ${!Icon && "hidden"} border-light-border dark:border-dark-border bg-light-background-form-secondary dark:bg-dark-background-form-secondary transition-all duration-300`}
      style={{
        ...(typeof window !== "undefined" &&
          window.innerWidth < 768 && {
            marginLeft: openSliderBar ? "0" : "",
          }),
      }}
    >
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-light-text dark:text-dark-text">
          {Icon && <Icon className="w-6 h-6" />} {title}
        </h1>
        <p className="text-sm text-light-muted dark:text-dark-muted  mt-2 flex items-center gap-2 w-fit max-w-full break-words">
          <RiMessage2Line className="w-4 h-4 text-light-muted dark:text-dark-muted" />
          {subtitle}
        </p>
      </div>
    </header>
  );
};

export default Header;
