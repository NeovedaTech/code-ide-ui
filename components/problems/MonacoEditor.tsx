/* eslint-disable @typescript-eslint/no-explicit-any */
import Editor, { type OnMount } from "@monaco-editor/react";
import { Box, CircularProgress } from "@mui/material";
import React, { useRef } from "react";

import type { editor } from "monaco-editor";

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  parentRef?: any;
}

const computeMaxEditorHeight = () => {
  return "calc(100vh - 80px)"; // same as calc(100vh - 80px)
};

const MAX_EDITOR_HEIGHT = computeMaxEditorHeight();

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  language,
  onChange,
  readOnly = false,
  parentRef,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    onChange(value ?? "");
    adjustEditorHeight();
  };

  const adjustEditorHeight = () => {
    const editor = editorRef.current;
    const container = containerRef.current;
    if (!editor || !container) {
      return;
    }

    // const contentHeight = editor.getContentHeight();

    // if (contentHeight < MAX_EDITOR_HEIGHT) {
    //   // ➜ grow editor naturally
    //   container.style.height = `${contentHeight}px`;
    // } else {
    // ➜ lock height and allow scrolling
    container.style.height = `${MAX_EDITOR_HEIGHT}px`;

    // scroll parent to bottom
    if (parentRef?.current) {
      parentRef.current.scrollTop = parentRef.current.scrollHeight;
    }
    // }
  };

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.updateOptions({
      readOnly,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: "on",
      glyphMargin: false,
      folding: false,
      renderLineHighlight: "none",
      fontSize: 13,
      wordWrap: "on",
      padding: { top: 16, bottom: 16 },
      automaticLayout: false,
    });
    editor.onDidScrollChange((e) => {
      const scrollTop = e.scrollTop;
      const scrollHeight = editor.getScrollHeight();
      const height = editor.getLayoutInfo().height;
      const hasScroll = scrollHeight > height + 5;

      const isAtBottom = hasScroll && scrollTop + height >= scrollHeight - 5;

      if (isAtBottom && e.scrollTopChanged && parentRef?.current) {
        adjustEditorHeight();
        parentRef.current.scrollTop = parentRef.current.scrollHeight;
      }
    });
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        overflow: "hidden", // editor grows
        maxHeight: MAX_EDITOR_HEIGHT,
        height: "100%",
        minHeight: `calc(100vh - ${320}px)`,
        position: "relative",
        // borderRadius: "6px",
        // mt: 0.4,
        background: "#020817",
        "& .monaco-editor": {
          backgroundColor: "transparent !important",
        },
        "& .monaco-editor-background": {
          backgroundColor: "transparent !important",
        },
        "& .monaco-editor .margin": {
          backgroundColor: "transparent !important",
        },
      }}
    >
      <Editor
        theme="vs-dark"
        height="100%"
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        // options={{
        //   readOnly,
        //   automaticLayout: true,
        //   scrollBeyondLastLine: false,
        //   minimap: { enabled: false },
        // }}
        options={{
          readOnly,
          minimap: { enabled: false },
          contextmenu: false,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: "visible",
            horizontal: "hidden",
            handleMouseWheel: true,
            alwaysConsumeMouseWheel: false,
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          smoothScrolling: true,
        }}
        loading={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        }
      />
    </Box>
  );
};
