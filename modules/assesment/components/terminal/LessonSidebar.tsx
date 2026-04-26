"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import { BookOpen, ChevronRight, CheckCircle2, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";

export interface Lesson {
  id: string;
  title: string;
  content: string;
  expectedCommands?: string[];
  successExplanation?: string;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export const mockChapters: Chapter[] = [
  {
    id: "ch1",
    title: "Chapter 1: Basics",
    lessons: [
      {
        id: "l1",
        title: "Introduction",
        content: `### Welcome to the Terminal
The terminal is your direct line to the operating system.

**Try this:**
Run \`whoami\` to see your current username.`,
        expectedCommands: ["whoami"],
        successExplanation: "Great! The `whoami` command prints the effective username of the current user when invoked.",
      },
      {
        id: "l2",
        title: "Print Directory (pwd)",
        content: `### Where are you?
The \`pwd\` command stands for **Print Working Directory**.

**Try this:**
Type \`pwd\` and press Enter.`,
        expectedCommands: ["pwd"],
        successExplanation: "Excellent. \`pwd\` helps you stay oriented by showing exactly where you are in the file system.",
      },
      {
        id: "l3",
        title: "List Files (ls)",
        content: `### What's around you?
The \`ls\` command lists files and directories in your current location.

**Try this:**
Type \`ls\` and press Enter.`,
        expectedCommands: ["ls"],
        successExplanation: "Nice! \`ls\` is the most common way to explore the contents of a directory.",
      },
    ],
  },
  {
    id: "ch2",
    title: "Chapter 2: Navigation",
    lessons: [
      {
        id: "l4",
        title: "Move to Temp (cd)",
        content: `### Moving Around
Use \`cd <directory>\` to change your current location.

**Try this:**
Type \`cd /tmp\` to move to the temporary folder.`,
        expectedCommands: ["cd /tmp"],
        successExplanation: "You've moved! The \`/tmp\` directory is a standard Linux folder for temporary files.",
      },
      {
        id: "l5",
        title: "Go Back (cd ..)",
        content: `### Going Up
Use \`cd ..\` to move up one level in the folder hierarchy.

**Try this:**
Type \`cd ..\` to go back to the previous folder.`,
        expectedCommands: ["cd .."],
        successExplanation: "Perfect. \`..\` always refers to the parent directory.",
      },
    ],
  },
  {
    id: "ch3",
    title: "Chapter 3: File Creation",
    lessons: [
      {
        id: "l6",
        title: "Create File (touch)",
        content: `### Creating empty files
The \`touch\` command creates a new empty file instantly.

**Try this:**
Run \`touch hello.txt\`.`,
        expectedCommands: ["touch hello.txt"],
        successExplanation: "File created! You can now see it if you run \`ls\`.",
      },
      {
        id: "l7",
        title: "Create Folder (mkdir)",
        content: `### Making Directories
Use \`mkdir\` (make directory) to create a new folder.

**Try this:**
Run \`mkdir my_folder\`.`,
        expectedCommands: ["mkdir my_folder"],
        successExplanation: "Folder ready. Organization is key in Linux!",
      },
    ],
  },
  {
    id: "ch4",
    title: "Chapter 4: File Manipulation",
    lessons: [
      {
        id: "l8",
        title: "Copy File (cp)",
        content: `### Copying
\`cp\` allows you to duplicate files.

**Try this:**
Copy your file: \`cp hello.txt backup.txt\``,
        expectedCommands: ["cp hello.txt backup.txt"],
        successExplanation: "Success! You now have two identical files.",
      },
      {
        id: "l9",
        title: "Rename File (mv)",
        content: `### Moving/Renaming
In Linux, renaming a file is just moving it to a new name.

**Try this:**
Rename the backup: \`mv backup.txt old.txt\``,
        expectedCommands: ["mv backup.txt old.txt"],
        successExplanation: "Renamed! The original file content remains the same.",
      },
    ],
  },
  {
    id: "ch5",
    title: "Chapter 5: Deletion",
    lessons: [
      {
        id: "l10",
        title: "Remove File (rm)",
        content: `### Deleting
**Warning:** \`rm\` is permanent!

**Try this:**
Delete the file: \`rm old.txt\``,
        expectedCommands: ["rm old.txt"],
        successExplanation: "Gone! Be careful with this command in the future.",
      },
      {
        id: "l11",
        title: "Remove Folder (rmdir)",
        content: `### Deleting Folders
\`rmdir\` deletes empty directories.

**Try this:**
Remove your folder: \`rmdir my_folder\``,
        expectedCommands: ["rmdir my_folder"],
        successExplanation: "Cleaned up! If a folder has files, you would need \`rm -r\`.",
      },
    ],
  },
  {
    id: "ch6",
    title: "Chapter 6: Viewing Files",
    lessons: [
      {
        id: "l12",
        title: "Print Content (cat)",
        content: `### Reading Files
\`cat\` prints the entire content of a file to the screen.

**Try this:**
First, create a file with text: \`echo "Linux is cool" > note.txt\`
Then read it: \`cat note.txt\``,
        expectedCommands: ["cat note.txt"],
        successExplanation: "You read the file! \`cat\` is short for concatenate.",
      },
    ],
  },
  {
    id: "ch7",
    title: "Chapter 7: Permissions",
    lessons: [
      {
        id: "l13",
        title: "Change Mode (chmod)",
        content: `### Permissions
\`chmod\` changes who can read, write, or execute a file.

**Try this:**
Make your note executable: \`chmod +x note.txt\``,
        expectedCommands: ["chmod +x note.txt"],
        successExplanation: "Permissions updated. This is how you make scripts runnable!",
      },
    ],
  },
  {
    id: "ch8",
    title: "Chapter 8: Search",
    lessons: [
      {
        id: "l14",
        title: "Search Text (grep)",
        content: `### Finding Text
\`grep\` is used to search for patterns inside files.

**Try this:**
Find "Linux" in your file: \`grep "Linux" note.txt\``,
        expectedCommands: ["grep \"Linux\" note.txt"],
        successExplanation: "Found! \`grep\` is incredibly powerful for searching through logs.",
      },
    ],
  },
  {
    id: "ch9",
    title: "Chapter 9: Monitoring",
    lessons: [
      {
        id: "l15",
        title: "Disk Space (df)",
        content: `### System Stats
\`df -h\` shows how much disk space is left in a human-readable format.

**Try this:**
Run \`df -h\`.`,
        expectedCommands: ["df -h"],
        successExplanation: "Now you know how much storage your cloud instance has!",
      },
    ],
  },
  {
    id: "ch10",
    title: "Chapter 10: Networking",
    lessons: [
      {
        id: "l16",
        title: "Fetch URL (curl)",
        content: `### Web Requests
\`curl\` is a tool to transfer data from or to a server.

**Try this:**
Fetch Google's homepage: \`curl https://www.google.com\``,
        expectedCommands: ["curl https://www.google.com"],
        successExplanation: "Connected! You just performed a network request from your terminal.",
      },
    ],
  },
];

interface LessonSidebarProps {
  selectedLessonId: string;
  setSelectedLessonId: (id: string) => void;
  completedLessonIds: Set<string>;
  onNextLesson: () => void;
  onPrevLesson: () => void;
  lessonProgress: Record<string, string[]>;
}

export default function LessonSidebar({
  selectedLessonId,
  setSelectedLessonId,
  completedLessonIds,
  onNextLesson,
  onPrevLesson,
  lessonProgress
}: LessonSidebarProps) {
  
  const allLessons = useMemo(() => {
    return mockChapters.flatMap(chapter => chapter.lessons);
  }, []);

  const selectedLesson = useMemo(() => {
    return allLessons.find(l => l.id === selectedLessonId) || allLessons[0];
  }, [selectedLessonId, allLessons]);

  const isCompleted = completedLessonIds.has(selectedLesson.id);

  // Helper to check if a specific lesson is locked
  const isLessonLocked = (lessonId: string) => {
    const index = allLessons.findIndex(l => l.id === lessonId);
    if (index === 0) return false; // First lesson is never locked
    const prevLesson = allLessons[index - 1];
    return !completedLessonIds.has(prevLesson.id);
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        borderRight: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", bgcolor: "#f9fafb" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <BookOpen size={20} />
          Terminal Course
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", display: "flex" }}>
        {/* Chapter List */}
        <Box sx={{ width: "250px", borderRight: "1px solid #e5e7eb", bgcolor: "#fcfcfc" }}>
          <List sx={{ p: 0 }}>
            {mockChapters.map((chapter) => (
              <React.Fragment key={chapter.id}>
                <Box sx={{ px: 2, py: 1.5, bgcolor: "#f3f4f6" }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>
                    {chapter.title}
                  </Typography>
                </Box>
                {chapter.lessons.map((lesson) => {
                  const locked = isLessonLocked(lesson.id);
                  const active = selectedLessonId === lesson.id;
                  
                  return (
                    <ListItem key={lesson.id} disablePadding>
                      <ListItemButton
                        selected={active}
                        disabled={locked}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        sx={{
                          opacity: locked ? 0.5 : 1,
                          "&.Mui-selected": {
                            bgcolor: "rgba(59, 130, 246, 0.1)",
                            borderLeft: "3px solid #3b82f6",
                            "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" },
                          },
                          "&.Mui-disabled": {
                            opacity: 0.5,
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {locked && <Lock size={14} color="#94a3b8" />}
                                <Typography sx={{ fontSize: "0.875rem", fontWeight: active ? 600 : 400 }}>
                                  {lesson.title}
                                </Typography>
                              </Box>
                              {completedLessonIds.has(lesson.id) && (
                                <CheckCircle2 size={14} color="#10b981" />
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Lesson Content */}
        <Box sx={{ flex: 1, p: 3, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <Box sx={{ flex: 1 }}>
            <Box className="prose prose-slate max-w-none">
              <ReactMarkdown>{selectedLesson.content}</ReactMarkdown>
            </Box>

            {isCompleted && selectedLesson.successExplanation && (
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: "rgba(16, 185, 129, 0.05)", 
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" sx={{ color: "#059669", fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircle2 size={16} />
                  Lesson Completed!
                </Typography>
                <Box className="prose prose-sm prose-emerald">
                   <ReactMarkdown>{selectedLesson.successExplanation}</ReactMarkdown>
                </Box>
              </Box>
            )}
          </Box>
          
          <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}>
            <Button variant="outlined" size="small" onClick={onPrevLesson}>
              Previous
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              onClick={onNextLesson}
              disabled={!isCompleted}
              endIcon={<ChevronRight size={16} />}
              sx={{ 
                bgcolor: isCompleted ? "#3b82f6" : "#94a3b8",
                "&:disabled": {
                  bgcolor: "#e2e8f0",
                  color: "#94a3b8"
                }
              }}
            >
              Next Lesson
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
