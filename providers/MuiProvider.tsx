"use client";

import theme from "@/styling/theme";
import { ThemeProvider, CssBaseline } from "@mui/material";

export default function MuiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
