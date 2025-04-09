"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  // useTheme // Removido
} from "@mui/material";
import {
  FaHome,
  FaUsers,
  FaTachometerAlt,
  FaChartBar,
  FaUserFriends,
  FaBars,
  FaCog,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import ThemeSwitcher from "../theme/ThemeSwitcher"; // Ajuste o caminho se necessário
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// --- Definições e Funções Auxiliares ---
const menuItems = [
  {
    id: "home",
    title: "Home",
    icon: <FaHome fontSize="medium" />,
    children: [
      { id: "dashboard", title: "Dashboard", icon: <FaTachometerAlt /> },
      { id: "reports", title: "Reports", icon: <FaChartBar /> },
    ],
  },
  {
    id: "users",
    title: "Usuários",
    icon: <FaUsers fontSize="medium" />,
    children: [
      { id: "all_users", title: "Listar usuários", icon: <FaUserFriends /> },
    ],
  },
];

const renderMenuItems = (
  items,
  depth = 0,
  onClick,
  expandedItems,
  parentTitle = ""
) => {
  return items.map((item) => (
    <div key={item.id}>
      <ListItem disablePadding sx={{ pl: depth * 2, width: "100%" }}>
        <ListItemButton
          onClick={() => onClick(item.id)}
          sx={{
            width: "100%",
            justifyContent: "flex-start",
            pr: "16px",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ListItemIcon
            className="text-light-text dark:text-dark-text"
            sx={{ minWidth: "auto", mr: "16px" }}
          >
            {" "}
            {item.icon}{" "}
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            className="text-light-text dark:text-dark-text"
            sx={{ flexGrow: 1, mx: 0 }}
          />
          {item.children && item.children.length > 0 && (
            <ListItemIcon
              className="text-light-text dark:text-dark-text"
              sx={{ minWidth: "auto", ml: "16px" }}
            >
              {" "}
              {expandedItems[item.id] ? (
                <FaChevronDown />
              ) : (
                <FaChevronRight />
              )}{" "}
            </ListItemIcon>
          )}
        </ListItemButton>
      </ListItem>
      {item.children && item.children.length > 0 && expandedItems[item.id] && (
        <List sx={{ width: "100%", py: 0 }}>
          {" "}
          {renderMenuItems(
            item.children,
            depth + 1,
            onClick,
            expandedItems,
            item.title
          )}{" "}
        </List>
      )}
    </div>
  ));
};

const findItemById = (items, id) => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

// --- Componente Principal ---
const SidebarComponent = () => {
  const { data: session } = useSession();
  const [openSliderBar, setOpenSliderBar] = useState(null);
  const [openSideBar, setOpenSideBar] = useState(true);
  const [currentMenuTitle, setCurrentMenuTitle] = useState("");
  const [currentMenuIcon, setCurrentMenuIcon] = useState(null);
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState({});

  const headerHeight = "4rem";
  const sidebarWidth = "4.5rem";
  const sliderWidth = "16rem";

  const dynamicMenuItems = useMemo(() => menuItems, []);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      const shouldBeOpen = !isMobileView;
      setOpenSideBar((currentOpenState) => {
        if (currentOpenState !== shouldBeOpen) {
          if (!shouldBeOpen) {
            setOpenSliderBar(null);
            setCurrentMenuTitle("");
            setCurrentMenuIcon(null);
          }
          return shouldBeOpen;
        }
        return currentOpenState;
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = useCallback(() => {
    setOpenSideBar(false);
    setOpenSliderBar(null);
    setCurrentMenuTitle("");
    setCurrentMenuIcon(null);
  }, []);
  const handleSubItemClick = useCallback(
    (itemId) => {
      const parentMenu = dynamicMenuItems.find((i) => i.id === openSliderBar);
      const item = findItemById(parentMenu?.children || [], itemId);
      if (!item) return;
      if (item?.children?.length > 0) {
        setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
      } else if (item) {
        switch (itemId) {
          case "edit_profile":
            if (session?.user?.id) {
              router.push(`/user/register?userId=${session.user.id}`);
            } else {
              console.error("ID do usuário não disponível");
            }
            break;
          case "logout":
            signOut({ redirect: false });
            break;
          case "dashboard":
            router.push("/dashboard");
            break;
          case "reports":
            router.push("/reports");
            break;
          case "all_users":
            router.push("/users/list");
            break;
          default:
            break;
        }
        setOpenSliderBar(null);
        setCurrentMenuTitle("");
        setCurrentMenuIcon(null);
      }
    },
    [dynamicMenuItems, openSliderBar, router, session?.user?.id]
  );
  const handleMenuItemMouseEnter = useCallback(
    (itemId) => {
      if (openSideBar) {
        setOpenSliderBar(itemId);
        if (itemId === "settings") {
          setCurrentMenuTitle("Configurações");
          setCurrentMenuIcon(<FaCog fontSize="medium" />);
        } else {
          const item = dynamicMenuItems.find((i) => i.id === itemId);
          setCurrentMenuTitle(item?.title || "");
          setCurrentMenuIcon(item?.icon || null);
        }
        setExpandedItems({});
      }
    },
    [openSideBar, dynamicMenuItems]
  );
  const handleSliderBarMouseLeave = useCallback(() => {
    setOpenSliderBar(null);
    setCurrentMenuTitle("");
    setCurrentMenuIcon(null);
  }, []);
  const handleMenuItemMouseLeave = useCallback((event) => {
    const relatedTarget = event.relatedTarget;
    const sliderbar = document.querySelector(".sliderbar");
    if (
      sliderbar &&
      relatedTarget instanceof Node &&
      sliderbar.contains(relatedTarget)
    ) {
      return;
    }
    setOpenSliderBar(null);
    setCurrentMenuTitle("");
    setCurrentMenuIcon(null);
  }, []);

  if (!session) {
    return null;
  }

  // --- Valores de zIndex em constantes nomeadas ---
  // Usando constantes para melhorar a manutenibilidade e evitar valores mágicos
  const Z_INDEX = {
    HAMBURGER: 25,
    DRAWER: 20,
    SLIDER: 10,
  };

  return (
    <>
      {!openSideBar && (
        <button
          className="fixed left-4 p-2 bg-light-primary dark:bg-dark-primary rounded-full text-light-text dark:text-dark-text hover:bg-opacity-80 shadow-lg"
          style={{
            top: `calc(${headerHeight} + 1rem)`,
            zIndex: Z_INDEX.HAMBURGER,
          }}
          onClick={() => {
            setOpenSideBar(true);
            setOpenSliderBar(null);
          }}
          aria-label="Abrir menu"
        >
          <FaBars fontSize="medium" />
        </button>
      )}

      <Drawer
        variant="permanent"
        className="bg-light-background-sidebar dark:bg-dark-background-sidebar"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            position: "fixed",
            top: headerHeight,
            left: openSideBar ? "0" : `-${sidebarWidth}`,
            height: `calc(100vh - ${headerHeight})`,
            width: sidebarWidth,
            overflow: "hidden",
            transition: "left 300ms ease-in-out, opacity 300ms ease-in-out",
            opacity: openSideBar ? 1 : 0,
            pointerEvents: openSideBar ? "auto" : "none",
            backgroundColor: "inherit",
            borderRight: 1,
            borderColor: "divider",
            zIndex: Z_INDEX.DRAWER,
            boxSizing: "border-box",
          },
        }}
      >
        <List className="flex flex-col h-full pt-0">
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleMenuClick}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "4rem",
                padding: 0,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}>
                {" "}
                <FaBars
                  fontSize="medium"
                  className="text-light-text dark:text-dark-text"
                />{" "}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
          {dynamicMenuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onMouseEnter={() => handleMenuItemMouseEnter(item.id)}
                onMouseLeave={handleMenuItemMouseLeave}
                selected={openSliderBar === item.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "4rem",
                  padding: 0,
                  "&:hover": { bgcolor: "action.hover" },
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    "&:hover": { bgcolor: "action.selected" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}> {item.icon} </ListItemIcon>
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding sx={{ marginTop: "auto" }}>
            <ListItemButton
              onMouseEnter={() => handleMenuItemMouseEnter("settings")}
              onMouseLeave={handleMenuItemMouseLeave}
              selected={openSliderBar === "settings"}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "4rem",
                padding: 0,
                "&:hover": { bgcolor: "action.hover" },
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                  "&:hover": { bgcolor: "action.selected" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}>
                {" "}
                <FaCog
                  fontSize="medium"
                  className="text-light-text dark:text-dark-text"
                />{" "}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box
        className={`sliderbar fixed w-64 shadow-lg bg-light-background-sidebar dark:bg-dark-background-sidebar`}
        sx={{
          position: "fixed",
          top: headerHeight,
          left: openSliderBar && openSideBar ? sidebarWidth : `-${sliderWidth}`,
          height: `calc(100vh - ${headerHeight})`,
          width: sliderWidth,
          zIndex: Z_INDEX.SLIDER,
          transition: "left 300ms ease-in-out, opacity 300ms ease-in-out",
          opacity: openSliderBar && openSideBar ? 1 : 0,
          pointerEvents: openSliderBar && openSideBar ? "auto" : "none",
          overflowY: "auto",
          borderRight: 1,
          borderColor: "divider",
          "& .MuiList-root": { padding: 0, width: "100%" },
          "& .MuiListItem-root": { width: "100%", margin: 0 },
          "& .MuiListItemButton-root": {
            width: "100%",
            margin: 0,
            paddingRight: "16px",
            "&:hover": { bgcolor: "action.hover" },
          },
        }}
        onMouseLeave={handleSliderBarMouseLeave}
      >
        {currentMenuTitle && (
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              height: "4rem",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              backgroundColor: "inherit",
              borderBottom: 1,
              borderColor: "divider",
              gap: "12px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.primary",
              }}
            >
              {" "}
              {currentMenuIcon}{" "}
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: "1.1rem",
                color: "text.primary",
              }}
            >
              {" "}
              {currentMenuTitle}{" "}
            </Typography>
          </Box>
        )}
        <List sx={{ pt: currentMenuTitle ? 0 : "0" }}>
          {openSliderBar === "settings" && (
            <Box sx={{ p: 2 }}>
              {" "}
              <ThemeSwitcher />{" "}
            </Box>
          )}
          {openSliderBar &&
            openSliderBar !== "settings" &&
            renderMenuItems(
              dynamicMenuItems.find((i) => i.id === openSliderBar)?.children ||
                [],
              0,
              handleSubItemClick,
              expandedItems
            )}
        </List>
      </Box>
    </>
  );
};

const Sidebar = memo(SidebarComponent);
export default Sidebar;
