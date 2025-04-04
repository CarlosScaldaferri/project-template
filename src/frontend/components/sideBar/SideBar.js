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
import ThemeSwitcher from "../theme/ThemeSwitcher";
import { FiEdit, FiLogOut } from "react-icons/fi";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Bell, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const menuItems = [
  {
    id: "home",
    title: "Home",
    icon: <Home fontSize="medium" />,
    children: [
      { id: "dashboard", title: "Dashboard", icon: <Dashboard /> },
      { id: "reports", title: "Reports", icon: <Assessment /> },
    ],
  },
  {
    id: "users",
    title: "Usuários",
    icon: <People fontSize="medium" />,
    children: [{ id: "all_users", title: "Listar usuários", icon: <Group /> }],
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
      <ListItem
        disablePadding
        sx={{
          pl: depth * 2,
          width: "100%",
        }}
      >
        <ListItemButton
          onClick={() => onClick(item.id)}
          sx={{
            width: "100%",
            justifyContent: "flex-start",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              ".dark &": {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
            },
          }}
        >
          <ListItemIcon
            className="text-light-text dark:text-dark-text"
            sx={{ minWidth: "auto", mr: "16px" }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            className="text-light-text dark:text-dark-text"
            sx={{ mx: 0 }}
          />
          {item.children && item.children.length > 0 && (
            <ListItemIcon
              className="text-light-text dark:text-dark-text"
              sx={{ minWidth: "auto", ml: "16px" }}
            >
              {expandedItems[item.id] ? <ExpandMore /> : <ChevronRight />}
            </ListItemIcon>
          )}
        </ListItemButton>
      </ListItem>
      {item.children && item.children.length > 0 && expandedItems[item.id] && (
        <List sx={{ width: "100%" }}>
          {renderMenuItems(
            item.children,
            depth + 1,
            onClick,
            expandedItems,
            parentTitle
          )}
        </List>
      )}
    </div>
  ));
};

const SidebarComponent = () => {
  const [openSliderBar, setOpenSliderBar] = useState(false);
  const [openSideBar, setOpenSideBar] = useState(true);
  const [currentMenuTitle, setCurrentMenuTitle] = useState("");
  const [currentMenuIcon, setCurrentMenuIcon] = useState(null);

  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [showButtons, setShowButtons] = useState(true);
  const { data: session, status } = useSession();

  const loginSubItems = useMemo(
    () => [
      { id: "edit_profile", title: "Editar perfil", icon: <FiEdit /> },
      { id: "notifications", title: "Notificações", icon: <Bell /> },
      { id: "logout", title: "Sair", icon: <FiLogOut /> },
    ],
    []
  );

  const dynamicMenuItems = useMemo(() => {
    if (!session) return menuItems;

    return menuItems.map((item) =>
      item.id === "users"
        ? {
            ...item,
            children: [
              ...item.children,
              {
                id: "user_menu",
                title: session.user.nickname
                  ? session.user.nickname
                  : "Usuário",
                icon: session.user.picture ? (
                  <Image
                    className="rounded-full border border-spacing-1 border-primary-dark"
                    src={
                      process.env.NEXT_PUBLIC_UPLOADS +
                      "/" +
                      session.user.picture
                    }
                    alt="User"
                    width={28}
                    height={28}
                  />
                ) : (
                  <User size={28} />
                ),
                children: loginSubItems,
              },
            ],
          }
        : item
    );
  }, [session, loginSubItems]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setOpenSideBar(session ? !mobile : false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setOpenSideBar, session]);

  const handleMenuClick = useCallback(() => {
    setOpenSideBar(!openSideBar);
    setOpenSliderBar(null);
    setCurrentMenuTitle("");
    setCurrentMenuIcon(null);
  }, [openSideBar, setOpenSideBar, setOpenSliderBar]);

  const handleMenuItemClick = useCallback(
    (itemId) => {
      if (openSliderBar === itemId) {
        setOpenSliderBar(null);
        setCurrentMenuTitle("");
        setCurrentMenuIcon(null);
      } else if (openSideBar) {
        setOpenSliderBar(itemId);
        const item = dynamicMenuItems.find((i) => i.id === itemId);
        setCurrentMenuTitle(item?.title || "");
        setCurrentMenuIcon(item?.icon || null);
      }
    },
    [openSliderBar, openSideBar, setOpenSliderBar, dynamicMenuItems]
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
            console.log("Reports clicked");
            break;
          default:
            break;
        }
        setOpenSliderBar(null);
        setCurrentMenuTitle("");
        setCurrentMenuIcon(null);
      }
    },
    [
      dynamicMenuItems,
      openSliderBar,
      router,
      session?.user?.id,
      setOpenSliderBar,
    ]
  );

  const handleSliderBarMouseLeave = useCallback(() => {
    setOpenSliderBar(null);
    setCurrentMenuTitle("");
    setCurrentMenuIcon(null);
  }, [setOpenSliderBar]);

  const handleMenuItemMouseEnter = useCallback(
    (itemId) => {
      if (openSideBar) {
        setOpenSliderBar(itemId);
        const item = dynamicMenuItems.find((i) => i.id === itemId);
        setCurrentMenuTitle(item?.title || "");
        setCurrentMenuIcon(item?.icon || null);
      }
    },
    [openSideBar, setOpenSliderBar, dynamicMenuItems]
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
        setCurrentMenuTitle("");
        setCurrentMenuIcon(null);
      }
    },
    [setOpenSliderBar]
  );

  return (
    <>
      {session && (
        <div className="flex relative">
          {!openSideBar && (
            <button
              className="fixed left-4 top-4 z-50 p-2 bg-light-primary dark:bg-dark-primary rounded-full text-light-text dark:text-dark-text hover:bg-opacity-80"
              onClick={() => setOpenSideBar(true)}
            >
              <MenuIcon fontSize="medium" />
            </button>
          )}

          <Drawer
            variant="permanent"
            className="bg-light-background-sidebar dark:bg-dark-background-sidebar"
            sx={{
              width: openSideBar ? "4.5rem" : "0",
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: openSideBar ? "4.5rem" : "0",
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
                  className="flex flex-col justify-center items-center min-h-[4rem] hover:bg-light-primary dark:hover:bg-dark-primary"
                  sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MenuIcon fontSize="medium" />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>

              {dynamicMenuItems.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    className="flex flex-col justify-center items-center min-h-[4rem] hover:bg-light-primary dark:hover:bg-dark-primary"
                    onClick={() => handleMenuItemClick(item.id)}
                    onMouseEnter={() => handleMenuItemMouseEnter(item.id)}
                    onMouseLeave={handleMenuItemMouseLeave}
                    sx={{
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 0,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>
              ))}

              <ListItem disablePadding>
                <ListItemButton
                  className="flex flex-col justify-center items-center min-h-[4rem] hover:bg-light-primary dark:hover:bg-dark-primary"
                  onClick={() => handleMenuItemClick("settings")}
                  onMouseEnter={() => {
                    if (openSideBar) {
                      setOpenSliderBar("settings");
                      setCurrentMenuTitle("Configurações");
                      setCurrentMenuIcon(<SettingsIcon fontSize="medium" />);
                    }
                  }}
                  onMouseLeave={handleMenuItemMouseLeave}
                  sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <SettingsIcon fontSize="medium" />
                  </ListItemIcon>
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
              ${openSliderBar && openSideBar ? "left-[4.5rem] opacity-100 pointer-events-auto" : "left-[-256px] opacity-0 pointer-events-none"}
            `}
            sx={{
              borderRight: 1,
              borderColor: "divider",
              "& .MuiList-root": { padding: 0, width: "100%" },
              "& .MuiListItem-root": { width: "100%", margin: 0 },
              "& .MuiListItemButton-root": {
                width: "100%",
                margin: 0,
                paddingRight: "16px",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  ".dark &": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
                },
              },
            }}
            onMouseLeave={handleSliderBarMouseLeave}
          >
            {currentMenuTitle && (
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  height: "4rem",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                  ".dark &": {
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                  },
                  gap: "12px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  {currentMenuIcon}
                </Box>
                <Typography
                  variant="h6"
                  className="text-light-text dark:text-dark-text"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  {currentMenuTitle}
                </Typography>
              </Box>
            )}
            <List>
              {openSliderBar === "settings" && <ThemeSwitcher />}
              {openSliderBar &&
                openSliderBar !== "settings" &&
                renderMenuItems(
                  dynamicMenuItems.find((i) => i.id === openSliderBar)
                    ?.children || [],
                  0,
                  handleSubItemClick,
                  expandedItems,
                  currentMenuTitle
                )}
            </List>
          </Box>
        </div>
      )}
    </>
  );
};

const Sidebar = memo(SidebarComponent);
export default Sidebar;
