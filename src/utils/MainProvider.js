"use client";
import { useSidebar } from "@/contexts/SidebarContext";
import PropTypes from "prop-types";

function MainContent({ children }) {
  const { openSliderBar } = useSidebar();

  return (
    <main
      className="min-h-screen transition-all duration-300"
      style={{
        marginLeft: openSliderBar ? "16rem" : "", // Padrão para desktop
        // Sobrescreve em mobile com media query ou lógica condicional
        ...(typeof window !== "undefined" &&
          window.innerWidth < 768 && {
            marginLeft: openSliderBar ? "0" : "", // Remove o margin em mobile
          }),
      }}
    >
      {children}
    </main>
  );
}

const MainProvider = ({ children }) => {
  return <MainContent>{children}</MainContent>;
};

MainProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainProvider;
