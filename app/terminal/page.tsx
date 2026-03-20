"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";
import LessonSidebar, { mockChapters, Lesson } from "@/components/terminal/LessonSidebar";
import TerminalInterface from "@/components/terminal/TerminalInterface";

export default function Page() {
  const [selectedLessonId, setSelectedLessonId] = useState<string>(mockChapters[0].lessons[0].id);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  // Flattened lessons for easy navigation
  const allLessons = useMemo(() => {
    return mockChapters.flatMap(chapter => chapter.lessons);
  }, []);

  const currentLessonIndex = useMemo(() => {
    return allLessons.findIndex(l => l.id === selectedLessonId);
  }, [selectedLessonId, allLessons]);

  const currentLesson = allLessons[currentLessonIndex];

  const handleNextLesson = useCallback(() => {
    if (currentLessonIndex < allLessons.length - 1) {
      setSelectedLessonId(allLessons[currentLessonIndex + 1].id);
    }
  }, [currentLessonIndex, allLessons]);

  const handlePrevLesson = useCallback(() => {
    if (currentLessonIndex > 0) {
      setSelectedLessonId(allLessons[currentLessonIndex - 1].id);
    }
  }, [currentLessonIndex, allLessons]);

  const [lessonProgress, setLessonProgress] = useState<Record<string, string[]>>({});

  // Monitor lesson progress to mark lessons as completed
  useEffect(() => {
    if (!currentLesson || !currentLesson.expectedCommands) return;
    
    const progress = lessonProgress[currentLesson.id] || [];
    if (progress.length >= currentLesson.expectedCommands.length) {
      if (!completedLessonIds.has(currentLesson.id)) {
        setCompletedLessonIds(prev => {
          const next = new Set(prev);
          next.add(currentLesson.id);
          return next;
        });
      }
    }
  }, [lessonProgress, currentLesson, completedLessonIds]);

  const handleTerminalCommand = useCallback((command: string) => {
    if (!currentLesson || !currentLesson.expectedCommands) return;

    const trimmedCommand = command.trim().toLowerCase();
    
    // Find matching expected commands that haven't been completed yet for this lesson
    const currentProgress = lessonProgress[currentLesson.id] || [];
    
    const newMatches = currentLesson.expectedCommands.filter(expected => {
      const lowerExpected = expected.toLowerCase();
      // Match if the typed command contains the expected command
      // AND we haven't already marked this specific expected command as matched
      return trimmedCommand.includes(lowerExpected) && !currentProgress.includes(expected);
    });

    if (newMatches.length > 0) {
      setLessonProgress(prev => ({
        ...prev,
        [currentLesson.id]: [...(prev[currentLesson.id] || []), ...newMatches]
      }));
    }
  }, [currentLesson, lessonProgress]);

  return (
    <Box sx={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      <Group>
        {/* Left Panel: Lessons */}
        <Panel defaultSize={40} minSize={30}>
          <LessonSidebar 
            selectedLessonId={selectedLessonId}
            setSelectedLessonId={setSelectedLessonId}
            completedLessonIds={completedLessonIds}
            onNextLesson={handleNextLesson}
            onPrevLesson={handlePrevLesson}
            lessonProgress={lessonProgress}
          />
        </Panel>

        {/* Resize Handle */}
        <Separator
          style={{
            width: "4px",
            background: "#e5e7eb",
            cursor: "col-resize",
          }}
        />

        {/* Right Panel: Terminal */}
        <Panel defaultSize={60} minSize={30}>
          <TerminalInterface onCommand={handleTerminalCommand} />
        </Panel>
      </Group>
    </Box>
  );
}
