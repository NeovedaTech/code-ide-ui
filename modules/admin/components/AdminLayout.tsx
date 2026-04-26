"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, Avatar, Divider, Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assignment as AssessmentIcon,
  People as PeopleIcon,
  Code as CodeIcon,
  QuestionAnswer as PoolIcon,
  Settings as SettingsIcon,
  ChevronLeft,
  Menu as MenuIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";

const DRAWER_WIDTH = 220;
const DRAWER_COLLAPSED = 64;

const NAV = [
  { label: "Dashboard",      href: "/admin/dashboard",       icon: <DashboardIcon /> },
  { label: "Assessments",    href: "/admin/assessments",     icon: <AssessmentIcon /> },
  { label: "Candidates",     href: "/admin/solutions",       icon: <PeopleIcon /> },
  { label: "Problems",       href: "/admin/problems",        icon: <CodeIcon /> },
  { label: "Question Pools", href: "/admin/question-pools",  icon: <PoolIcon /> },
  { label: "Settings",       href: "/admin/settings",        icon: <SettingsIcon /> },
];

const glass = {
  bgcolor: "rgba(255,255,255,0.03)",
  borderRight: "1px solid rgba(255,255,255,0.07)",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth() as { user: { name?: string } | null; logout: () => void };

  const width = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#060608" }}>
      {/* ── Sidebar ── */}
      <Drawer
        variant="permanent"
        sx={{
          width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            ...glass,
            background: "rgba(6,6,10,0.97)",
            backdropFilter: "blur(24px)",
            overflow: "hidden",
            transition: "width 0.2s ease",
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ px: 2, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: 1,
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>A</Typography>
          </Box>
          {!collapsed && (
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: 0.3 }}>
              Admin
            </Typography>
          )}
          <Box sx={{ flex: 1 }} />
          <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ color: "rgba(255,255,255,0.4)" }}>
            {collapsed ? <MenuIcon fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* Nav */}
        <List sx={{ px: 1, pt: 1, flex: 1 }}>
          {NAV.map(({ label, href, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Tooltip key={href} title={collapsed ? label : ""} placement="right">
                <ListItemButton
                  onClick={() => router.push(href)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.5,
                    px: collapsed ? 1.5 : 1.5,
                    minHeight: 40,
                    bgcolor: active ? "rgba(59,130,246,0.15)" : "transparent",
                    "&:hover": { bgcolor: active ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)" },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: 0,
                    mr: collapsed ? 0 : 1.5,
                    color: active ? "#3b82f6" : "rgba(255,255,255,0.45)",
                    "& svg": { fontSize: 18 },
                  }}>
                    {icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: active ? 600 : 400,
                        color: active ? "#fff" : "rgba(255,255,255,0.6)",
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* User */}
        <Box sx={{ px: 1.5, py: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: "#3b82f6", fontSize: 12 }}>
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </Avatar>
          {!collapsed && (
            <>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: "#fff", fontSize: 12, fontWeight: 600 }} noWrap>
                  {user?.name ?? "Admin"}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>
                  Administrator
                </Typography>
              </Box>
              <Tooltip title="Logout">
                <IconButton size="small" onClick={logout} sx={{ color: "rgba(255,255,255,0.35)" }}>
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Drawer>

      {/* ── Main content ── */}
      <Box component="main" sx={{ flex: 1, p: 3, overflow: "auto" }}>
        {children}
      </Box>
    </Box>
  );
}
