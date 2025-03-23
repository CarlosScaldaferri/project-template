"use client";
import { useSidebar } from "@/contexts/SidebarContext";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

function MainContent({ children }) {
  const { openSliderBar } = useSidebar();
  const [styles, setStyles] = useState({
    width: "100%",
    marginLeft: "0",
  });

  useEffect(() => {
    function updateLayout() {
      if (window.innerWidth < 768) {
        setStyles({ width: "100%", marginLeft: "0" });
      } else {
        setStyles({
          width: "80vw",
          marginLeft: openSliderBar ? "16rem" : "0",
        });
      }
    }

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [openSliderBar]);

  return (
    <main className="min-h-screen transition-all duration-300" style={styles}>
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
