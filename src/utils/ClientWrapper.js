"use client";

import { useSidebar } from "@/contexts/SidebarContext";

export default function ClientWrapper({ children }) {
  const { openSideBar } = useSidebar();

  return (
    <div className={`flex ${!openSideBar ? "flex-col" : ""} w-full`}>
      {children}
    </div>
  );
}
