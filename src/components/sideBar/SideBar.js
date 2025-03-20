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
} from "@mui/material";
import {
  Home,
  People,
  Dashboard,
  Assessment,
  Group,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  ExpandMore,
  ChevronRight,
} from "@mui/icons-material";
import { useSidebar } from "../../contexts/SidebarContext";
import ThemeSwitcher from "../theme/ThemeSwitcher";
import { FiEdit, FiLogOut, FiLogIn } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

const menuItems = [
  {
    id: "home",
    title: "Home",
    icon: <Home />,
    children: [
      { id: "dashboard", title: "Dashboard", icon: <Dashboard /> },
      { id: "reports", title: "Reports", icon: <Assessment /> },
    ],
  },
  {
    id: "users",
    title: "Usuários",
    icon: <People />,
    children: [{ id: "all_users", title: "Listar usuários", icon: <Group /> }],
  },
];

const renderMenuItems = (items, depth = 0, onClick, expandedItems) => {
  return items.map((item) => (
    <div key={item.id}>
      <ListItem disablePadding sx={{ pl: depth * 2 }}>
        <ListItemButton onClick={() => onClick(item.id)}>
          <ListItemIcon className="text-light-text dark:text-dark-text">
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            className="text-light-text dark:text-dark-text"
          />
          {item.children && item.children.length > 0 && (
            <ListItemIcon className="text-light-text dark:text-dark-text">
              {expandedItems[item.id] ? <ExpandMore /> : <ChevronRight />}
            </ListItemIcon>
          )}
        </ListItemButton>
      </ListItem>
      {item.children && item.children.length > 0 && expandedItems[item.id] && (
        <List sx={{ pl: 2 }}>
          {renderMenuItems(item.children, depth + 1, onClick, expandedItems)}
        </List>
      )}
    </div>
  ));
};

const SidebarComponent = () => {
  const { openSliderBar, setOpenSliderBar, openSideBar, setOpenSideBar } =
    useSidebar();
  const { user } = useAuth();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [imageSrc, setImageSrc] = useState("/img/user/default-user.png");
  const [expandedItems, setExpandedItems] = useState({});

  const loginSubItems = [
    { id: "edit_profile", title: "Editar perfil", icon: <FiEdit /> },
    { id: "logout", title: "Sair", icon: <FiLogOut /> },
  ];

  const truncateText = (text, maxLength) =>
    text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  const dynamicMenuItems = useMemo(() => {
    return menuItems.map((item) =>
      item.id === "users"
        ? {
            ...item,
            children: [
              ...item.children,
              {
                id: "user_menu",
                title: user
                  ? truncateText(user.nickname || user.name || "Usuário", 12)
                  : "Usuário",
                icon: imageSrc ? (
                  <Image
                    className="rounded-full border border-spacing-1 border-primary-dark"
                    src={imageSrc}
                    alt="User"
                    width={24}
                    height={24}
                  />
                ) : (
                  <FiLogIn />
                ),
                children: loginSubItems,
              },
            ],
          }
        : item
    );
  }, [user, imageSrc, loginSubItems]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setOpenSideBar(window.innerWidth >= 768 && !!user); // Só abre se usuário existir
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setOpenSideBar, user]);

  useEffect(() => {
    if (user?.picture) {
      setImageSrc(user.picture);
    } else {
      setImageSrc("/img/user/default-user.png");
    }
  }, [user?.picture]);

  const handleLoginClick = () => {
    router.push("/api/auth/login");
  };

  const handleMenuClick = useCallback(() => {
    setOpenSideBar(!openSideBar);
    setOpenSliderBar(null);
  }, [openSideBar, setOpenSideBar, setOpenSliderBar]);

  const handleMenuItemClick = useCallback(
    (itemId) => {
      if (openSliderBar === itemId) {
        setOpenSliderBar(null);
      } else if (openSideBar) {
        setOpenSliderBar(itemId);
      }
    },
    [openSliderBar, openSideBar, setOpenSliderBar]
  );

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

  const handleSubItemClick = useCallback(
    (itemId) => {
      const allChildren =
        dynamicMenuItems.find((i) => i.id === openSliderBar)?.children || [];
      const item = findItemById(allChildren, itemId);

      if (item?.children?.length > 0) {
        setExpandedItems((prev) => ({
          ...prev,
          [itemId]: !prev[itemId],
        }));
      } else if (item) {
        switch (itemId) {
          case "edit_profile":
            if (user?.sub) {
              router.push("/users/" + user.sub);
            } else {
              console.error("ID do usuário não disponível");
            }
            break;
          case "logout":
            window.location.href =
              "/api/auth/logout?returnTo=" +
              encodeURIComponent(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login`
              );
            break;
          case "login":
            router.push("/api/auth/login");
            break;
          case "dashboard":
            console.log("Dashboard clicked");
            break;
          case "reports":
            console.log("Reports clicked");
            break;
          default:
            break;
        }
        setOpenSliderBar(null);
      }
    },
    [dynamicMenuItems, openSliderBar, router, user?.sub, setOpenSliderBar]
  );

  const handleSliderBarMouseLeave = useCallback(() => {
    setOpenSliderBar(null);
  }, [setOpenSliderBar]);

  const handleMenuItemMouseEnter = useCallback(
    (itemId) => {
      if (openSideBar) {
        setOpenSliderBar(itemId);
      }
    },
    [openSideBar, setOpenSliderBar]
  );

  const handleMenuItemMouseLeave = useCallback(
    (event) => {
      const relatedTarget = event.relatedTarget;
      const sliderbar = document.querySelector(".sliderbar");
      if (
        sliderbar &&
        relatedTarget instanceof Node &&
        !sliderbar.contains(relatedTarget)
      ) {
        setOpenSliderBar(null);
      }
    },
    [setOpenSliderBar]
  );

  // Se usuário for null ou undefined, mostra apenas o botão de login
  if (!user) {
    return (
      <div className="fixed left-4 top-4 z-50">
        <button
          className="p-2 bg-light-primary dark:bg-dark-primary rounded-full text-light-text dark:text-dark-text hover:bg-opacity-80 flex items-center gap-2"
          onClick={handleLoginClick}
        >
          <FiLogIn />
          Entrar
        </button>
      </div>
    );
  }

  // Se usuário existir, mostra a Sidebar
  return (
    <div className="flex relative">
      {!openSideBar && (
        <button
          className="fixed left-4 top-4 z-50 p-2 bg-light-primary dark:bg-dark-primary rounded-full text-light-text dark:text-dark-text hover:bg-opacity-80"
          onClick={() => setOpenSideBar(true)}
        >
          <MenuIcon />
        </button>
      )}

      <Drawer
        variant="permanent"
        className="bg-light-background-sidebar dark:bg-dark-background-sidebar"
        sx={{
          width: openSideBar ? "8rem" : "0",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: openSideBar ? "8rem" : "0",
            overflow: "hidden",
            transition: "all 300ms ease-in-out",
            backgroundColor: "inherit",
            zIndex: 40,
          },
        }}
      >
        <List className="flex flex-col h-full">
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleMenuClick}
              className="flex flex-col justify-center items-center gap-1 min-h-[32px] hover:bg-light-primary dark:hover:bg-dark-primary"
            >
              <ListItemIcon className="flex items-center justify-center min-w-0 text-light-text dark:text-dark-text">
                <MenuIcon />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>

          {dynamicMenuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                className="flex flex-col justify-center items-center gap-1 min-h-[64px] hover:bg-light-primary dark:hover:bg-dark-primary"
                onClick={() => handleMenuItemClick(item.id)}
                onMouseEnter={() => handleMenuItemMouseEnter(item.id)}
                onMouseLeave={handleMenuItemMouseLeave}
              >
                <ListItemIcon className="flex items-center justify-center min-w-0 text-light-text dark:text-dark-text">
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  className="text-xs text-light-text dark:text-dark-text"
                />
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding>
            <ListItemButton
              className="flex flex-col justify-center items-center gap-1 min-h-[64px] hover:bg-light-primary dark:hover:bg-dark-primary"
              onClick={() => handleMenuItemClick("settings")}
              onMouseEnter={() => openSideBar && setOpenSliderBar("settings")}
              onMouseLeave={handleMenuItemMouseLeave}
            >
              <ListItemIcon className="flex items-center justify-center min-w-0 text-light-text dark:text-dark-text">
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Configurações"
                className="text-xs text-light-text dark:text-dark-text"
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box
        className={`
          fixed top-0 h-full w-64 shadow-lg z-30
          transition-all duration-300 ease-in-out
          bg-light-background-sidebar dark:bg-dark-background-sidebar
          sliderbar
          ${
            openSliderBar && openSideBar
              ? "left-[8rem] opacity-100 pointer-events-auto"
              : "left-[-256px] opacity-0 pointer-events-none"
          }
        `}
        sx={{ borderRight: 1, borderColor: "divider" }}
        onMouseLeave={handleSliderBarMouseLeave}
      >
        <List>
          {openSliderBar === "settings" && <ThemeSwitcher />}
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
    </div>
  );
};

const Sidebar = memo(SidebarComponent);

export default Sidebar;
