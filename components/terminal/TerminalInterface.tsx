"use client";

import React, { useRef, useState, useEffect } from "react";
import { LoadingBox } from "@/shared/LoadingBox";
import { Box, Button, Typography } from "@mui/material";
import { Terminal as TerminalIcon } from "lucide-react";

interface TerminalInterfaceProps {
  onCommand?: (command: string) => void;
}

export default function TerminalInterface({ onCommand }: TerminalInterfaceProps) {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const termRef = useRef<any>(null);
  const inputBuffer = useRef<string>("");
  const [status, setStatus] = useState<"idle" | "creating" | "connected">("idle");

  const initTerminal = async () => {
    if (!terminalRef.current) return;

    // Dynamically import only in browser
    const { Terminal } = await import("xterm");
    const { FitAddon } = await import("xterm-addon-fit");
    // Ensure CSS is loaded for proper rendering
    import("xterm/css/xterm.css");

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: "#0f172a",
        foreground: "#e2e8f0",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current!);
    fitAddon.fit();

    termRef.current = term;

    connectSocket(term, fitAddon);

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      socketRef.current?.close();
      term.dispose();
    };
  };

  const connectSocket = (term: any, fitAddon: any) => {
    const socket = new WebSocket("ws://localhost:4000");
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus("connected");
      setTimeout(() => fitAddon.fit(), 100);
      term.focus();
    };

    socket.onmessage = (event) => {
      term.write(event.data);
    };

    socket.onclose = () => {
      setStatus("idle");
    };

    socket.onerror = () => {
      socket.close();
      setStatus("idle");
    };

    term.onData((data: string) => {
      if (socket.readyState === WebSocket.OPEN) {
        // Buffer local commands for validation
        if (data === "\r" || data === "\n") { // Enter key
          const command = inputBuffer.current.trim();
          if (command && onCommand) {
            onCommand(command);
          }
          inputBuffer.current = "";
        } else if (data === "\u007f") { // Backspace
          if (inputBuffer.current.length > 0) {
            inputBuffer.current = inputBuffer.current.slice(0, -1);
          }
        } else if (data.length === 1 && data.charCodeAt(0) >= 32) {
          // Only buffer printable characters
          inputBuffer.current += data;
        }

        socket.send(
          JSON.stringify({
            type: "input",
            data,
          })
        );
      }
    });
  };

  const handleCreateInstance = () => {
    setStatus("creating");
    setTimeout(() => {
      initTerminal();
    }, 1000);
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <LoadingBox
        isOpen={status === "creating"}
        message="Provisioning your cloud instance..."
      />

      {status === "idle" && (
        <Box
          sx={{
            textAlign: "center",
            p: 4,
            borderRadius: 2,
            bgcolor: "rgba(30, 41, 59, 0.5)",
            border: "1px solid rgba(51, 65, 85, 0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "rgba(59, 130, 246, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <TerminalIcon size={40} color="#3b82f6" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: "white", fontWeight: 600, mb: 1 }}>
              Cloud Terminal
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", maxWidth: 300 }}>
              Launch a dedicated sandboxed environment for your development and
              debugging tasks.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={handleCreateInstance}
            sx={{
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb" },
              textTransform: "none",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Create Instance
          </Button>
        </Box>
      )}

      <Box
        ref={terminalRef}
        sx={{
          height: "100%",
          width: "100%",
          p: 1,
          display: status === "connected" ? "block" : "none",
        }}
      />
    </Box>
  );
}
