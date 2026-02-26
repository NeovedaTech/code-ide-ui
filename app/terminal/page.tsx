"use client";

import React, { useEffect, useRef, useState } from "react";

export default function Page() {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const termRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    const initTerminal = async () => {
      // Dynamically import only in browser
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");
      await import("xterm/css/xterm.css");

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

    initTerminal();
  }, []);

  const connectSocket = (term: any, fitAddon: any) => {
    const socket = new WebSocket("ws://localhost:4000");
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      fitAddon.fit();
    };

    socket.onmessage = (event) => {
      term.write(event.data);
    };

    socket.onclose = () => {
      setConnected(false);
      setTimeout(() => connectSocket(term, fitAddon), 2000);
    };

    socket.onerror = () => {
      socket.close();
    };

    term.onData((data: string) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "input",
            data,
          })
        );
      }
    });
  };

  return (
    <div style={{ height: "100vh", width: "100%", background: "#0f172a" }}>
      {!connected && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 20,
            color: "#f87171",
            fontSize: "14px",
          }}
        >
          Connecting...
        </div>
      )}
      <div ref={terminalRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}