 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef } from 'react'
import { CodingProblem } from '@/types/assessment'
import Editor from '@monaco-editor/react'
import type { Monaco } from '@monaco-editor/react'

// interface StorageKey {
//   problemId: string
//   problemTitle: string
//   language: string
// }

const generateStorageKey = (problemId: string, problemTitle: string, language: string): string => {
  return `${problemId}|${problemTitle}|${language}`
}

const getStoredCode = (problemId: string, problemTitle: string, language: string): string => {
  try {
    const key = generateStorageKey(problemId, problemTitle, language)
    const stored = localStorage.getItem(`code:${key}`)
    return stored || ''
  } catch (e) {
    console.warn('Failed to access localStorage:', e)
    return ''
  }
}

const saveCode = (problemId: string, problemTitle: string, language: string, code: string): void => {
  try {
    const key = generateStorageKey(problemId, problemTitle, language)
    localStorage.setItem(`code:${key}`, code)
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }
}

const getLanguageMode = (language: string): string => {
  const languageMap: Record<string, string> = {
    python: 'python',
    cpp: 'cpp',
    c: 'c',
    java: 'java',
    javascript: 'javascript',
    typescript: 'typescript',
    go: 'go',
    rust: 'rust',
    csharp: 'csharp'
  }
  return languageMap[language] || 'plaintext'
}

export default function ProblemEditor({ problem }: { problem: CodingProblem }) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    problem.languagesSupported?.[0] || 'python'
  )
  const [code, setCode] = useState<string>('')
  const [isSaved, setIsSaved] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const editorRef = useRef<any>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load code when component mounts or language changes
  useEffect(() => {
    setIsLoading(true)
    const stored = getStoredCode(problem._id, problem.title, selectedLanguage)
    const signature = problem.functionSignature?.find(
      (sig) => sig.language === selectedLanguage
    )?.signature

    const initialCode = stored || signature || `# Write your ${selectedLanguage} code here`
    setCode(initialCode)
    setIsSaved(true)
    setIsLoading(false)
  }, [selectedLanguage, problem._id, problem.title, problem.functionSignature])

  // Auto-save with debounce
  useEffect(() => {
    if (code && !isLoading) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveCode(problem._id, problem.title, selectedLanguage, code)
        setIsSaved(true)
      }, 1500)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [code, selectedLanguage, problem._id, problem.title, isLoading])

  const handleLanguageChange = (language: string) => {
    // Save current code before switching
    if (code && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveCode(problem._id, problem.title, selectedLanguage, code)
    }
    setSelectedLanguage(language)
  }

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
      setIsSaved(false)
    }
  }

  const handleEditorMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor

    // Configure Monaco editor options
    editor.updateOptions({
      fontSize: 13,
      lineHeight: 20,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      cursorBlinking: 'blink',
      smoothScrolling: true,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      formatOnPaste: true,
      formatOnType: true
    })

    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveCode(problem._id, problem.title, selectedLanguage, code)
      setIsSaved(true)
    })
  }

  const handleReset = () => {
    const signature = problem.functionSignature?.find(
      (sig) => sig.language === selectedLanguage
    )?.signature
    const resetCode = signature || `# Write your ${selectedLanguage} code here`
    setCode(resetCode)
    setIsSaved(false)
  }

  const handleSaveManually = () => {
    saveCode(problem._id, problem.title, selectedLanguage, code)
    setIsSaved(true)
  }

  const currentSignature = problem.functionSignature?.find(
    (sig) => sig.language === selectedLanguage
  )?.signature

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>Code Editor</h2>
          <p style={styles.subtitle}>
            Problem: <span style={{ fontWeight: '600', color: '#1f2937' }}>{problem.title}</span>
          </p>
        </div>
        <div style={styles.saveStatus}>
          <span
            style={{
              ...styles.statusIndicator,
              backgroundColor: isSaved ? '#10b981' : '#f59e0b'
            }}
            title={isSaved ? 'All changes saved' : 'Auto-saving...'}
          />
          <span style={styles.statusText}>{isSaved ? 'All saved' : 'Saving...'}</span>
        </div>
      </div>

      {/* Language Selector */}
      <div style={styles.languagePanel}>
        <label style={styles.languageLabel}>Select Language:</label>
        <div style={styles.languageButtonGroup}>
          {problem.languagesSupported?.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              style={{
                ...styles.languageButton,
                ...(selectedLanguage === lang
                  ? styles.languageButtonActive
                  : styles.languageButtonInactive)
              }}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Signature Display */}
      {currentSignature && (
        <div style={styles.signaturePanel}>
          <p style={styles.signatureLabel}>Function Signature:</p>
          <pre style={styles.signatureCode}>{currentSignature}</pre>
        </div>
      )}

      {/* Monaco Editor */}
      <div style={styles.editorWrapper}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <p style={styles.loadingText}>Loading editor...</p>
          </div>
        ) : (
          <Editor
            height="100%"
            language={getLanguageMode(selectedLanguage)}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorMount}
            theme="vs-light"
            options={{
              fontSize: 13,
              lineHeight: 20,
              wordWrap: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              cursorBlinking: 'blink',
              smoothScrolling: true,
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              formatOnPaste: true,
              formatOnType: true,
              padding: { top: 16, bottom: 16 }
            }}
          />
        )}
      </div>

      {/* Action Bar */}
      <div style={styles.actionBar}>
        <button
          onClick={handleSaveManually}
          disabled={isSaved}
          style={{
            ...styles.button,
            ...styles.saveButton,
            ...(isSaved ? styles.buttonDisabled : {})
          }}
          title="Ctrl+S or Cmd+S"
        >
          💾 Save Code
        </button>
        <button
          onClick={handleReset}
          style={{ ...styles.button, ...styles.resetButton }}
          title="Reset to function signature"
        >
          🔄 Reset
        </button>
      </div>

      {/* Storage Info */}
      <div style={styles.storageInfo}>
        <p style={styles.storageInfoText}>
          💾 Your code is automatically saved to your browser's local storage with key:{' '}
          <code style={styles.storageKey}>
            {problem._id}|{problem.title}|{selectedLanguage}
          </code>
          <br />
          📝 Changes auto-save after 1.5 seconds of inactivity. Press Ctrl+S (Cmd+S on Mac) to save manually.
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb'
  },
  headerLeft: {
    flex: 1
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: '#000'
  },
  subtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0'
  },
  saveStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    minWidth: '120px'
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  },
  statusText: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151'
  },
  languagePanel: {
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb'
  },
  languageLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px'
  },
  languageButtonGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  languageButton: {
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: '#fff'
  },
  languageButtonActive: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  },
  languageButtonInactive: {
    color: '#374151',
    backgroundColor: '#f9fafb'
  },
  signaturePanel: {
    padding: '16px 24px',
    backgroundColor: '#eff6ff',
    borderBottom: '1px solid #bfdbfe',
    borderTop: '1px solid #bfdbfe'
  },
  signatureLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1e40af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 8px 0'
  },
  signatureCode: {
    margin: '0',
    padding: '12px',
    backgroundColor: '#fff',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: "'Fira Code', 'Courier New', monospace",
    color: '#1e40af',
    overflow: 'auto',
    maxHeight: '100px'
  },
  editorWrapper: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative'
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: '#fff'
  },
  loadingText: {
    fontSize: '14px',
    color: '#9ca3af'
  },
  actionBar: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e7eb'
  },
  button: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    color: '#fff'
  },
  resetButton: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db'
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: '#e5e7eb',
    color: '#9ca3af'
  },
  storageInfo: {
    padding: '12px 24px',
    backgroundColor: '#fef3c7',
    borderTop: '1px solid #fcd34d',
    fontSize: '12px',
    color: '#92400e'
  },
  storageInfoText: {
    margin: '0',
    lineHeight: '1.5'
  },
  storageKey: {
    backgroundColor: '#fff8dc',
    padding: '2px 6px',
    borderRadius: '3px',
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontSize: '11px',
    color: '#b45309'
  }
}