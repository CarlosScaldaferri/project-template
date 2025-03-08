"use client";

import { useState } from "react";
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
  Info,
  People,
  Dashboard,
  Assessment,
  Group,
  Business,
  History,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useSidebar } from "../../contexts/SidebarContext";
import ThemeSwitcher from "../theme/ThemeSwitcher";

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
  {
    id: "about",
    title: "Sobre",
    icon: <Info />,
    children: [
      { id: "company", title: "Company", icon: <Business /> },
      { id: "team", title: "Team", icon: <History /> },
    ],
  },
];

const renderMenuItems = (items, depth = 0, openItems, toggleOpen) => {
  return items.map((item) => {
    const isOpen = openItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <ListItem disablePadding sx={{ pl: depth * 2 }}>
          <ListItemButton onClick={() => hasChildren && toggleOpen(item.id)}>
            <ListItemIcon className="text-light-text dark:text-dark-text">
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              className="text-light-text dark:text-dark-text"
            />
          </ListItemButton>
        </ListItem>
        {hasChildren && isOpen && (
          <div>
            {renderMenuItems(item.children, depth + 1, openItems, toggleOpen)}
          </div>
        )}
      </div>
    );
  });
};

export default function Sidebar() {
  const { openSliderBar, setOpenSliderBar, openSideBar, setOpenSideBar } =
    useSidebar();
  const [isHovering, setIsHovering] = useState(false);
  const [openSubItems, setOpenSubItems] = useState([]);

  const toggleSubItem = (id) => {
    setOpenSubItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSidebar = () => {
    setOpenSideBar(!openSideBar);
    setOpenSliderBar(null); // Close any open submenus when toggling sidebar
  };

  return (
    <div className={`flex ${openSideBar ? "h-screen" : "h-16"} relative`}>
      {/* Hamburger button outside sidebar when hidden */}
      {!openSideBar && (
        <div className="fixed w-full z-40 p-5 bg-light-background-form-secondary dark:bg-dark-background-form-secondary">
          <button
            className="rounded-md bg-light-background-form-secondary dark:bg-dark-background-form-secondary text-light-text dark:text-dark-text"
            onClick={toggleSidebar}
          >
            <MenuIcon />
          </button>
        </div>
      )}

      {/* Main Sidebar Drawer */}
      <Drawer
        variant="permanent"
        className="bg-light-background-sidebar dark:bg-dark-background-sidebar"
        sx={{
          width: openSideBar ? "5.5rem" : "0",
          flexShrink: 0,
          display: { xs: openSideBar ? "block" : "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: openSideBar ? "5.5rem" : "0",
            overflow: "hidden",
            transition: "all 300ms ease-in-out",
            backgroundColor: "inherit", // Herda a cor do className
          },
        }}
      >
        <List className="flex flex-col h-full">
          {/* Hamburger Menu as first item */}
          <ListItem disablePadding>
            <ListItemButton
              className="flex flex-col justify-center items-center gap-1 min-h-[64px] hover:bg-light-primary dark:hover:bg-dark-primary"
              onClick={toggleSidebar}
            >
              <ListItemIcon className="flex items-center justify-center min-w-0 text-light-text dark:text-dark-text">
                <MenuIcon />
              </ListItemIcon>
              <ListItemText
                primary="Menu"
                className="text-xs text-light-text dark:text-dark-text"
              />
            </ListItemButton>
          </ListItem>

          {/* Other menu items */}
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                className="flex flex-col justify-center items-center gap-1 min-h-[64px] hover:bg-light-primary dark:hover:bg-dark-primary"
                onMouseEnter={() => {
                  if (item.children && item.children.length > 0) {
                    setOpenSliderBar(item.id);
                  } else {
                    setOpenSliderBar(null);
                  }
                }}
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

          {/* Theme Switcher at bottom */}
          <div className="mt-auto">
            <ListItem disablePadding>
              <ThemeSwitcher />
            </ListItem>
          </div>
        </List>
      </Drawer>

      {/* Submenu Drawer */}
      <Box
        className={`
            fixed top-0 h-full w-64 shadow-lg z-30
            transition-all duration-300 ease-in-out
            bg-light-background-sidebar dark:bg-dark-background-sidebar            
            ${
              openSliderBar && openSideBar
                ? "left-[5.5rem] opacity-100 pointer-events-auto"
                : "left-[-256px] opacity-0 pointer-events-none"
            }
          `}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setOpenSliderBar(null);
        }}
      >
        <List>
          {openSliderBar &&
            renderMenuItems(
              menuItems.find((item) => item.id === openSliderBar)?.children ||
                [],
              0,
              openSubItems,
              toggleSubItem
            )}
        </List>
      </Box>
    </div>
  );
}
