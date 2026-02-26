"use client";

import React, { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

export default function Page() {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const termRef = useRef<XTerm | null>(null);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const term = new XTerm({
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

    connectSocket(term);

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      socketRef.current?.close();
      term.dispose();
    };
  }, []);

  const connectSocket = (term: XTerm) => {
    const socket = new WebSocket("ws://localhost:4000");
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onmessage = (event) => {
      term.write(event.data);
    };

    socket.onclose = () => {
      setConnected(false);
      setTimeout(() => connectSocket(term), 2000);
    };

    socket.onerror = () => {
      socket.close();
    };

    // Important: Register once per connection
    term.onData((data) => {
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
      <div
        ref={terminalRef}
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
}