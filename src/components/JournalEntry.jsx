import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import * as LucideIcons from "lucide-react";
import { useAsyncStorage } from "../hooks/useAsyncStorage.js";
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';

const springTransition = { type: "spring", stiffness: 350, damping: 30 };

const PROMPTS = [
  { id: 'day', label: 'How was the day', icon: LucideIcons.Sun },
  { id: 'grateful', label: 'Grateful for', icon: LucideIcons.Heart },
  { id: 'book', label: 'Book notes', icon: LucideIcons.BookOpen },
  { id: 'work', label: 'Work log', icon: LucideIcons.Briefcase },
  { id: 'goal', label: 'Goal check-in', icon: LucideIcons.Target }
];

// Auto-resizing textarea for blocks
const AutoResizeTextarea = React.forwardRef(({ value, onChange, onKeyDown, placeholder, style, autoFocus, id, onFocus, onBlur }, ref) => {
  const internalRef = useRef(null);
  const textareaRef = ref || internalRef;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value, textareaRef]);

  return (
    <textarea
      id={id}
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      autoFocus={autoFocus}
      style={{
        ...style,
        overflow: 'hidden',
        resize: 'none',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
      }}
      rows={1}
    />
  );
});

// Common Input Component (Moved outside to prevent focus loss on re-render)
const EntryInput = ({ placeholder, value, onChange, isTextarea = false, theme, fontBody }) => {
  const commonStyles = {
    width: "100%", background: theme.bg, 
    border: "none", outline: "none",
    boxShadow: theme.shadowInset,
    color: theme.textPrimary, fontSize: 14, ...fontBody,
    padding: "12px 16px", borderRadius: 16,
    transition: "border 0.2s",
    boxSizing: 'border-box'
  };

  if (isTextarea) {
    return (
      <AutoResizeTextarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...commonStyles, minHeight: 80 }}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={commonStyles}
    />
  );
};

const slashOptions = [
  { id: 'text', label: 'Text', icon: LucideIcons.FileText, type: 'text', format: 'p' },
  { id: 'h1', label: 'Heading 1', icon: LucideIcons.Type, type: 'text', format: 'h1' },
  { id: 'h2', label: 'Heading 2', icon: LucideIcons.Type, type: 'text', format: 'h2' },
  { id: 'checklist', label: 'To-do list', icon: LucideIcons.CheckSquare, type: 'checklist', format: 'p' },
  { id: 'bullet', label: 'Bulleted list', icon: LucideIcons.List, type: 'bullet', format: 'p' },
  { id: 'quote', label: 'Quote', icon: LucideIcons.Quote, type: 'quote', format: 'p' },
  { id: 'code', label: 'Code Block', icon: LucideIcons.Code, type: 'code', format: 'p' },
  { id: 'divider', label: 'Divider', icon: LucideIcons.Minus, type: 'divider', format: 'p' }
];

export default function JournalEntry({ theme, fontDisplay, fontBody, NeoSurface, folderId = null, onSaved, onCancel, initialEntry = null }) {
  const [mode, setMode] = useState(initialEntry ? initialEntry.mode : null); // 'free' or 'guided'
  const [activePrompt, setActivePrompt] = useState(initialEntry ? initialEntry.prompt : null);
  const [title, setTitle] = useState(initialEntry?.title || "");
  const [isDirty, setIsDirty] = useState(false);

  // Form states
  const [blocks, setBlocks] = useState(initialEntry && initialEntry.mode === 'free' && initialEntry.data.blocks ? initialEntry.data.blocks : [{ id: Date.now(), type: 'text', content: '', checked: false, format: 'p', indent: 0 }]);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [slashMenu, setSlashMenu] = useState({ show: false, blockId: null, search: '', selectedIndex: 0 });

  const blockRefs = useRef({});
  const caretPosRef = useRef(null); // Used to set caret position after merging

  useEffect(() => {
    if (activeBlockId) {
      setTimeout(() => {
        const el = blockRefs.current[activeBlockId] || document.getElementById(`block-${activeBlockId}`);
        if (el) {
          el.focus();
          if (caretPosRef.current !== null && el.setSelectionRange) {
            el.setSelectionRange(caretPosRef.current, caretPosRef.current);
            caretPosRef.current = null;
          }
        }
      }, 0);
    }
  }, [activeBlockId]);
  
  const [dayMood, setDayMood] = useState(initialEntry?.data?.dayMood || null);
  const [dayBest, setDayBest] = useState(initialEntry?.data?.dayBest || "");
  const [dayDrained, setDayDrained] = useState(initialEntry?.data?.dayDrained || "");
  const [dayElse, setDayElse] = useState(initialEntry?.data?.dayElse || "");

  const [grateful1, setGrateful1] = useState(initialEntry?.data?.grateful1 || "");
  const [grateful2, setGrateful2] = useState(initialEntry?.data?.grateful2 || "");
  const [grateful3, setGrateful3] = useState(initialEntry?.data?.grateful3 || "");

  const [bookTitle, setBookTitle] = useState(initialEntry?.data?.bookTitle || "");
  const [bookCh, setBookCh] = useState(initialEntry?.data?.bookCh || "");
  const [bookQuote, setBookQuote] = useState(initialEntry?.data?.bookQuote || "");
  const [bookThoughts, setBookThoughts] = useState(initialEntry?.data?.bookThoughts || "");

  const [workBuilt, setWorkBuilt] = useState(initialEntry?.data?.workBuilt || "");
  const [workBlockers, setWorkBlockers] = useState(initialEntry?.data?.workBlockers || "");
  const [workDecisions, setWorkDecisions] = useState(initialEntry?.data?.workDecisions || "");

  const [goalWhich, setGoalWhich] = useState(initialEntry?.data?.goalWhich || "");
  const [goalProgress, setGoalProgress] = useState(initialEntry?.data?.goalProgress || 60);
  const [goalWins, setGoalWins] = useState(initialEntry?.data?.goalWins || "");
  const [goalBlockers, setGoalBlockers] = useState(initialEntry?.data?.goalBlockers || "");

  // Toolbar states
  const [isRecording, setIsRecording] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [entryMood, setEntryMood] = useState(initialEntry?.mood || null);
  const [tags, setTags] = useState(initialEntry?.tags || []);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState("");
  
  // Global Entry Font
  const [entryFont, setEntryFont] = useState(initialEntry?.font || 'sans'); // 'sans', 'serif', 'mono'

  const closeForm = () => {
    setMode(null);
    setActivePrompt(null);
    // Reset states
    setBlocks([{ id: Date.now(), type: 'text', content: '', checked: false, format: 'p', indent: 0 }]);
    setSlashMenu({ show: false, blockId: null, search: '', selectedIndex: 0 });
    setDayMood(null); setDayBest(""); setDayDrained(""); setDayElse("");
    setGrateful1(""); setGrateful2(""); setGrateful3("");
    setBookTitle(""); setBookCh(""); setBookQuote(""); setBookThoughts("");
    setWorkBuilt(""); setWorkBlockers(""); setWorkDecisions("");
    setGoalWhich(""); setGoalProgress(60); setGoalWins(""); setGoalBlockers("");
    setEntryMood(null); setTags([]);
    setEntryFont('sans');
    setShowTypePicker(false);
    setTitle("");
    setIsDirty(false);
    if (onCancel) onCancel();
  };

  const saveEntry = useCallback((closeFormFlag = false) => {
    if (!mode) return;
    
    const entryData = {
      id: initialEntry ? initialEntry.id : Date.now(),
      date: initialEntry ? initialEntry.date : new Date().toISOString(),
      folderId: folderId,
      mode,
      prompt: activePrompt,
      title,
      mood: entryMood,
      tags: tags,
      font: entryFont,
      data: {}
    };

    if (mode === 'free') {
      entryData.data.blocks = blocks;
    } else if (activePrompt === 'day') {
      entryData.data = { dayMood, dayBest, dayDrained, dayElse };
    } else if (activePrompt === 'grateful') {
      entryData.data = { grateful1, grateful2, grateful3 };
    } else if (activePrompt === 'book') {
      entryData.data = { bookTitle, bookCh, bookQuote, bookThoughts };
    } else if (activePrompt === 'work') {
      entryData.data = { workBuilt, workBlockers, workDecisions };
    } else if (activePrompt === 'goal') {
      entryData.data = { goalWhich, goalProgress, goalWins, goalBlockers };
    }    
    
    if (closeFormFlag) {
      closeForm();
      if (onSaved) onSaved(entryData, false);
    } else {
      if (onSaved) onSaved(entryData, true);
    }
  }, [initialEntry, folderId, mode, activePrompt, title, entryMood, tags, entryFont, blocks, dayMood, dayBest, dayDrained, dayElse, grateful1, grateful2, grateful3, bookTitle, bookCh, bookQuote, bookThoughts, workBuilt, workBlockers, workDecisions, goalWhich, goalProgress, goalWins, goalBlockers, onSaved]);

  useEffect(() => {
    if (mode) {
      setIsDirty(true);
    }
  }, [blocks, title, entryMood, tags, entryFont, dayMood, dayBest, dayDrained, dayElse, grateful1, grateful2, grateful3, bookTitle, bookCh, bookQuote, bookThoughts, workBuilt, workBlockers, workDecisions, goalWhich, goalProgress, goalWins, goalBlockers]);

  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      saveEntry(false);
      setIsDirty(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [saveEntry, isDirty]);

  /* Toolbar Actions */
  const handleMic = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      // Append mock transcription
      if (mode === 'free') {
        const newBlocks = [...blocks];
        const lastBlock = newBlocks[newBlocks.length - 1];
        if (lastBlock.type === 'text') {
          lastBlock.content += (lastBlock.content ? ' ' : '') + "This is a placeholder transcribed text.";
        } else {
          newBlocks.push({ id: Date.now(), type: 'text', content: "This is a placeholder transcribed text.", checked: false, format: 'p' });
        }
        setBlocks(newBlocks);
      } else if (activePrompt === 'day') {
        setDayBest(prev => prev + (prev ? ' ' : '') + "Mock transcription.");
      }
      // (Can be extended for other fields)
    }, 2000);
  };

  const handleImage = () => {
    alert("Image storage is coming soon! (Storage optimizations pending)");
  };

  const handleChecklist = () => {
    if (mode !== 'free') return;
    setBlocks([...blocks, { id: Date.now(), type: 'checklist', content: '', checked: false, format: 'p' }]);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      setShowTagInput(false);
    }
  };

  /* Block Editor Functions */
  const updateBlock = (id, content) => {
    let newType = null;
    let newFormat = null;
    let cleanContent = content;
    
    // Markdown Auto-formatting
    if (content === '# ') { newType = 'text'; newFormat = 'h1'; cleanContent = ''; }
    else if (content === '## ') { newType = 'text'; newFormat = 'h2'; cleanContent = ''; }
    else if (content === '- ' || content === '* ') { newType = 'bullet'; newFormat = 'p'; cleanContent = ''; }
    else if (content === '[] ') { newType = 'checklist'; newFormat = 'p'; cleanContent = ''; }
    else if (content === '> ') { newType = 'quote'; newFormat = 'p'; cleanContent = ''; }
    else if (content === '---' || content === '--- ') { newType = 'divider'; newFormat = 'p'; cleanContent = ''; }
    else if (content === '``` ' || content === '```') { newType = 'code'; newFormat = 'p'; cleanContent = ''; }
    
    // Check for Slash Command
    if (content.endsWith('/')) {
      setSlashMenu({ show: true, blockId: id, search: '' });
    } else if (slashMenu.show && slashMenu.blockId === id) {
      const match = content.match(/\/([^ ]*)$/);
      if (match) {
        setSlashMenu({ show: true, blockId: id, search: match[1].toLowerCase(), selectedIndex: 0 });
      } else {
        setSlashMenu({ show: false, blockId: null, search: '', selectedIndex: 0 });
      }
    }

    if (newType === 'divider') {
      const newBlocks = blocks.map(b => b.id === id ? { 
        ...b, 
        content: cleanContent,
        type: newType, format: newFormat
      } : b);
      const index = blocks.findIndex(b => b.id === id);
      const newBlockId = Date.now();
      newBlocks.splice(index + 1, 0, { id: newBlockId, type: 'text', content: '', checked: false, format: 'p', indent: 0 });
      setBlocks(newBlocks);
      setActiveBlockId(newBlockId);
    } else {
      setBlocks(blocks.map(b => b.id === id ? { 
        ...b, 
        content: cleanContent,
        ...(newType ? { type: newType, format: newFormat } : {})
      } : b));
    }
  };

  const toggleChecklist = (id) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, checked: !b.checked } : b));
  };

  const handleBlockKeyDown = (e, index, block) => {
    const target = e.target;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    // --- Slash Menu Navigation ---
    if (slashMenu.show) {
      const filteredOptions = slashOptions.filter(opt => opt.label.toLowerCase().includes(slashMenu.search));
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIdx = slashMenu.selectedIndex || 0;
        const nextIdx = (currentIdx + 1) % (filteredOptions.length || 1);
        setSlashMenu(prev => ({ ...prev, selectedIndex: nextIdx }));
        const el = document.getElementById(`slash-opt-${nextIdx}`);
        if (el) el.scrollIntoView({ block: 'nearest' });
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIdx = slashMenu.selectedIndex || 0;
        const nextIdx = (currentIdx - 1 + filteredOptions.length) % (filteredOptions.length || 1);
        setSlashMenu(prev => ({ ...prev, selectedIndex: nextIdx }));
        const el = document.getElementById(`slash-opt-${nextIdx}`);
        if (el) el.scrollIntoView({ block: 'nearest' });
        return;
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const newBlocks = [...blocks];
      if (e.shiftKey) {
        newBlocks[index].indent = Math.max(0, (newBlocks[index].indent || 0) - 1);
      } else {
        newBlocks[index].indent = Math.min(3, (newBlocks[index].indent || 0) + 1);
      }
      setBlocks(newBlocks);
      return;
    }

    // --- Arrow Navigation ---
    if (e.key === 'ArrowUp') {
      if (start === 0 && index > 0) {
        e.preventDefault();
        setActiveBlockId(blocks[index - 1].id);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      if (end === target.value.length && index < blocks.length - 1) {
        e.preventDefault();
        setActiveBlockId(blocks[index + 1].id);
      }
      return;
    }
    if (e.key === 'ArrowLeft') {
      if (start === 0 && end === 0 && index > 0) {
        e.preventDefault();
        setActiveBlockId(blocks[index - 1].id);
        caretPosRef.current = blocks[index - 1].content.length;
      }
      return;
    }
    if (e.key === 'ArrowRight') {
      if (start === target.value.length && end === target.value.length && index < blocks.length - 1) {
        e.preventDefault();
        setActiveBlockId(blocks[index + 1].id);
        caretPosRef.current = 0;
      }
      return;
    }

    if (e.key === 'Enter') {
      if (slashMenu.show) {
        e.preventDefault();
        const filteredOptions = slashOptions.filter(opt => opt.label.toLowerCase().includes(slashMenu.search));
        if (filteredOptions.length > 0) {
          applySlashCommand(filteredOptions[slashMenu.selectedIndex || 0]);
        } else {
          setSlashMenu({ show: false, blockId: null, search: '', selectedIndex: 0 });
        }
        return;
      }
      if (block.type === 'code') {
        // Exit code block on double enter
        if (start > 0 && block.content.charAt(start - 1) === '\n') {
          e.preventDefault();
          const beforeDoubleNewline = block.content.substring(0, start - 1);
          const afterDoubleNewline = block.content.substring(end);
          const newBlocks = [...blocks];
          newBlocks[index] = { ...block, content: beforeDoubleNewline };
          const newBlockId = Date.now();
          newBlocks.splice(index + 1, 0, { id: newBlockId, type: 'text', content: afterDoubleNewline, checked: false, format: 'p', indent: block.indent || 0 });
          setBlocks(newBlocks);
          setActiveBlockId(newBlockId);
          return;
        }
        // If it's a single enter, let Editor component handle it normally (it auto-indents!)
        return;
      }

      e.preventDefault();
      const beforeCursor = block.content.substring(0, start);
      const afterCursor = block.content.substring(end);
      const newBlocks = [...blocks];
      
      if (block.type === 'checklist' || block.type === 'bullet') {
        if (block.content.trim() === '') {
          // Empty checklist/bullet + enter = convert back to text
          newBlocks[index] = { ...block, type: 'text', indent: 0 };
          setBlocks(newBlocks);
        } else {
          // Add new checklist/bullet item below
          newBlocks[index] = { ...block, content: beforeCursor };
          const newBlockId = Date.now();
          newBlocks.splice(index + 1, 0, { id: newBlockId, type: block.type, content: afterCursor, checked: false, format: 'p', indent: block.indent || 0 });
          setBlocks(newBlocks);
          setActiveBlockId(newBlockId);
        }
      } else {
        // Text block + enter = new text block (default to paragraph format)
        newBlocks[index] = { ...block, content: beforeCursor };
        const newBlockId = Date.now();
        newBlocks.splice(index + 1, 0, { id: newBlockId, type: 'text', content: afterCursor, checked: false, format: 'p', indent: block.indent || 0 });
        setBlocks(newBlocks);
        setActiveBlockId(newBlockId);
      }
    } else if (e.key === 'Backspace' && start === 0 && end === 0) {
      if (block.content === '') {
        if (block.type !== 'text') {
          e.preventDefault();
          const newBlocks = [...blocks];
          newBlocks[index] = { ...block, type: 'text', format: 'p', indent: 0 };
          setBlocks(newBlocks);
        } else if (index > 0) {
          e.preventDefault();
          const newBlocks = [...blocks];
          newBlocks.splice(index, 1);
          setBlocks(newBlocks);
          setActiveBlockId(newBlocks[index - 1].id);
          caretPosRef.current = newBlocks[index - 1].content.length;
        }
      } else if (index > 0) {
        e.preventDefault();
        const prevBlock = blocks[index - 1];
        const newBlocks = [...blocks];
        newBlocks[index - 1] = { ...prevBlock, content: prevBlock.content + block.content };
        newBlocks.splice(index, 1);
        setBlocks(newBlocks);
        setActiveBlockId(prevBlock.id);
        caretPosRef.current = prevBlock.content.length;
      }
    }
  };

  const setBlockFormat = (format) => {
    if (!activeBlockId) return;
    setBlocks(blocks.map(b => b.id === activeBlockId ? { ...b, format } : b));
  };

  const applySlashCommand = (cmd) => {
    if (!slashMenu.blockId) return;
    
    if (cmd.type === 'divider') {
      const newBlocks = blocks.map(b => b.id === slashMenu.blockId ? { 
        ...b, 
        type: cmd.type, 
        format: cmd.format, 
        content: ''
      } : b);
      const index = blocks.findIndex(b => b.id === slashMenu.blockId);
      newBlocks.splice(index + 1, 0, { id: Date.now(), type: 'text', content: '', checked: false, format: 'p', indent: 0 });
      setBlocks(newBlocks);
    } else {
      setBlocks(blocks.map(b => b.id === slashMenu.blockId ? { 
        ...b, 
        type: cmd.type, 
        format: cmd.format, 
        content: b.content.replace(/\/.*$/, '') 
      } : b));
    }
    setSlashMenu({ show: false, blockId: null, search: '', selectedIndex: 0 });
  };

  const renderToolbar = () => (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 48px)", maxWidth: 500,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 16px", background: theme.bg, boxShadow: theme.shadowRaised,
      borderRadius: 24, zIndex: 1010
    }}>
      <div style={{ display: "flex", gap: 16, color: theme.textSecondary, position: 'relative' }}>
        {mode === 'free' && (
          <button onClick={handleChecklist} style={{ background: 'transparent', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}>
            <LucideIcons.CheckSquare size={18} />
          </button>
        )}
        <button onClick={() => { setShowTypePicker(!showTypePicker); setShowMoodPicker(false); setShowTagInput(false); }} style={{ background: 'transparent', border: 'none', color: showTypePicker ? theme.accent : theme.textSecondary, cursor: 'pointer' }}>
          <LucideIcons.Type size={18} />
        </button>
        <button onClick={handleImage} style={{ background: 'transparent', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}>
          <LucideIcons.Image size={18} />
        </button>
        <button onClick={handleMic} style={{ background: 'transparent', border: 'none', color: isRecording ? theme.danger : theme.textSecondary, cursor: 'pointer', transition: 'color 0.2s' }}>
          <LucideIcons.Mic size={18} />
        </button>
        <button onClick={() => { setShowMoodPicker(!showMoodPicker); setShowTypePicker(false); setShowTagInput(false); }} style={{ background: 'transparent', border: 'none', color: entryMood ? theme.accent : theme.textSecondary, cursor: 'pointer' }}>
          {entryMood ? <span style={{ fontSize: 16 }}>{entryMood}</span> : <LucideIcons.Smile size={18} />}
        </button>
        <button onClick={() => { setShowTagInput(!showTagInput); setShowTypePicker(false); setShowMoodPicker(false); }} style={{ background: 'transparent', border: 'none', color: showTagInput || tags.length ? theme.accent : theme.textSecondary, cursor: 'pointer' }}>
          <LucideIcons.Tag size={18} />
        </button>

        {/* Typography Popover */}
        <AnimatePresence>
          {showTypePicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              style={{
                position: 'absolute', bottom: 40, left: 0, background: theme.bg, boxShadow: theme.shadowRaisedSm,
                borderRadius: 16, padding: "12px", display: 'flex', flexDirection: 'column', gap: 12, zIndex: 1020,
                minWidth: 160
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                {[{id: 'sans', label: 'Sans'}, {id: 'serif', label: 'Serif'}, {id: 'mono', label: 'Mono'}].map(f => (
                  <button key={f.id} onClick={() => setEntryFont(f.id)} style={{
                    flex: 1, padding: "6px 4px", borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: entryFont === f.id ? theme.accent : 'transparent',
                    color: entryFont === f.id ? '#fff' : theme.textSecondary,
                    boxShadow: entryFont === f.id ? theme.shadowInset : 'none'
                  }}>
                    {f.label}
                  </button>
                ))}
              </div>
              {mode === 'free' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  {[{id: 'h1', label: 'H1'}, {id: 'h2', label: 'H2'}, {id: 'p', label: 'P'}].map(fmt => {
                    const isActiveBlockFormat = blocks.find(b => b.id === activeBlockId)?.format === fmt.id;
                    return (
                      <button key={fmt.id} onClick={() => setBlockFormat(fmt.id)} style={{
                        flex: 1, padding: "6px 4px", borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                        background: isActiveBlockFormat ? theme.accent : 'transparent',
                        color: isActiveBlockFormat ? '#fff' : theme.textSecondary,
                        boxShadow: isActiveBlockFormat ? theme.shadowInset : 'none'
                      }}>
                        {fmt.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood Picker Popover */}
        <AnimatePresence>
          {showMoodPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              style={{
                position: 'absolute', bottom: 40, left: 60, background: theme.bg, boxShadow: theme.shadowRaisedSm,
                borderRadius: 16, padding: "8px 12px", display: 'flex', gap: 8, zIndex: 1020
              }}
            >
              {['😞', '😕', '😐', '🙂', '😄'].map(m => (
                <span key={m} onClick={() => { setEntryMood(m); setShowMoodPicker(false); }} style={{ cursor: 'pointer', fontSize: 18 }}>{m}</span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <LucideIcons.Keyboard size={18} color={theme.textSecondary} />
      </div>
    </div>
  );

  const getActiveFontFamily = () => {
    if (entryFont === 'serif') return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
    if (entryFont === 'mono') return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    return fontBody.fontFamily; // 'sans'
  };
  const activeFontFamily = getActiveFontFamily();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Top Level Menu */}
      <NeoSurface style={{ borderRadius: 24, padding: "24px 20px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: theme.textPrimary, ...fontDisplay, marginBottom: 4 }}>New note</div>
        <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 20, ...fontBody }}>Choose how you want to write</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Free Write */}
          <motion.div
            onClick={() => setMode('free')}
            style={{
              background: theme.bg, boxShadow: theme.shadowRaisedSm, borderRadius: 16, padding: "16px",
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
            }}
            whileTap={{ scale: 0.98, boxShadow: theme.shadowPressed }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: theme.bg, boxShadow: theme.shadowInset, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LucideIcons.Square size={20} color={theme.textPrimary} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Free write</div>
                <div style={{ fontSize: 13, color: theme.textSecondary, ...fontBody }}>Blank page, write anything</div>
              </div>
            </div>
            <LucideIcons.ChevronRight size={20} color={theme.textSecondary} />
          </motion.div>

          {/* Guided Entry Toggle */}
          <motion.div
            onClick={() => setMode(mode === 'guided' ? null : 'guided')}
            style={{
              background: theme.bg, boxShadow: theme.shadowRaisedSm, borderRadius: 16, padding: "16px",
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
            }}
            whileTap={{ scale: 0.98, boxShadow: theme.shadowPressed }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: theme.bg, boxShadow: theme.shadowInset, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LucideIcons.Layers size={20} color={theme.accent} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Guided entry</div>
                <div style={{ fontSize: 13, color: theme.textSecondary, ...fontBody }}>Pick a prompt to start from</div>
              </div>
            </div>
            <LucideIcons.ChevronRight size={20} color={theme.textSecondary} style={{ transform: mode === 'guided' ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </motion.div>
        </div>

        <AnimatePresence>
          {mode === 'guided' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={springTransition}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginTop: 24, marginBottom: 12, paddingLeft: 4 }}>
                Guided Prompts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PROMPTS.map(p => (
                  <motion.div
                    key={p.id}
                    onClick={() => setActivePrompt(p.id)}
                    style={{
                      background: theme.bg, boxShadow: theme.shadowRaisedSm, borderRadius: 12, padding: "14px 16px",
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
                    }}
                    whileTap={{ scale: 0.98, boxShadow: theme.shadowPressed }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: theme.bg, boxShadow: theme.shadowInset, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <p.icon size={16} color={p.id === 'day' ? '#F5A623' : p.id === 'grateful' ? '#50E3C2' : p.id === 'book' ? '#4A90E2' : p.id === 'work' ? '#F56A6A' : '#D0021B'} />
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: theme.textPrimary, ...fontBody }}>{p.label}</div>
                    </div>
                    <LucideIcons.ChevronRight size={16} color={theme.textSecondary} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </NeoSurface>

      {/* FULL SCREEN MODAL */}
      <AnimatePresence>
        {(mode === 'free' || activePrompt) && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onTouchStart={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}
            onTouchEnd={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            onMouseMove={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: theme.bg, zIndex: 1000,
              display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: "20px 24px", paddingBottom: 16,
              background: theme.bg, borderBottom: `1px solid ${theme.border}`, zIndex: 1001
            }}>
              <button onClick={closeForm} style={{ background: 'transparent', border: 'none', color: theme.textSecondary, fontSize: 15, ...fontBody, cursor: 'pointer' }}>
                Cancel
              </button>
              <div style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>
                {mode === 'free' ? 'Free write' : PROMPTS.find(p => p.id === activePrompt)?.label}
              </div>
              <button onClick={() => saveEntry(true)} style={{
                background: theme.bg, color: theme.accent, border: "none", boxShadow: theme.shadowRaisedSm,
                borderRadius: 12, padding: "6px 14px", fontSize: 14, fontWeight: 600,
                cursor: "pointer", ...fontBody
              }}>
                Save
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div 
              style={{ flex: 1, overflowY: 'auto', padding: "24px", paddingBottom: 120, cursor: 'text' }}
              onClick={(e) => {
                if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                  const lastBlock = blocks[blocks.length - 1];
                  if (lastBlock && lastBlock.content === '' && lastBlock.type === 'text') {
                    setActiveBlockId(lastBlock.id);
                  } else {
                    const newBlockId = Date.now();
                    setBlocks([...blocks, { id: newBlockId, type: 'text', content: '', checked: false, format: 'p', indent: 0 }]);
                    setActiveBlockId(newBlockId);
                  }
                }
              }}
            >
              {/* Title Input */}
              <input
                type="text"
                placeholder="Note Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: "100%", background: 'transparent', border: "none", outline: "none",
                  color: theme.textPrimary, fontSize: 24, fontWeight: 700, ...fontDisplay,
                  marginBottom: 16, padding: "0 4px"
                }}
              />
              
              {/* Tags Display */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {tags.map((tag, i) => (
                  <div key={i} style={{ background: theme.bg, boxShadow: theme.shadowRaisedSm, padding: "6px 14px", borderRadius: 16, fontSize: 13, color: theme.accent, fontWeight: 600 }}>
                    #{tag}
                  </div>
                ))}
                {showTagInput && (
                  <div style={{ display: 'flex', alignItems: 'center', background: theme.bg, boxShadow: theme.shadowInset, borderRadius: 16, padding: "4px 12px" }}>
                    <span style={{ color: theme.textSecondary }}>#</span>
                    <input
                      autoFocus
                      type="text"
                      value={newTag}
                      onChange={e => setNewTag(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      onKeyDown={handleAddTag}
                      onBlur={() => { if(newTag) { setTags([...tags, newTag]); setNewTag(""); } setShowTagInput(false); }}
                      placeholder="tag"
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: theme.textPrimary, width: 80, fontSize: 13, marginLeft: 4 }}
                    />
                  </div>
                )}
              </div>

              {/* FREE WRITE EDITOR */}
              {mode === 'free' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {blocks.map((block, i) => (
                      <Reorder.Item key={block.id} value={block} style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginLeft: (block.indent || 0) * 24 }}>
                          {/* Drag Handle */}
                          <div style={{ 
                            marginTop: block.format === 'h1' ? 6 : block.format === 'h2' ? 5 : 4, 
                            cursor: 'grab', opacity: 0.3
                          }}>
                            <LucideIcons.GripVertical size={16} color={theme.textSecondary} />
                          </div>

                          {block.type === 'checklist' && (
                            <button
                              onClick={() => toggleChecklist(block.id)}
                              style={{
                                marginTop: block.format === 'h1' ? 8 : block.format === 'h2' ? 6 : 2,
                                width: 20, height: 20, borderRadius: 6,
                                background: theme.bg, boxShadow: block.checked ? theme.shadowPressed : theme.shadowRaisedSm,
                                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', flexShrink: 0
                              }}
                            >
                              {block.checked && <LucideIcons.Check size={14} color={theme.accent} />}
                            </button>
                          )}

                          {block.type === 'bullet' && (
                            <div style={{ marginTop: 12, width: 6, height: 6, borderRadius: 3, background: theme.textPrimary, flexShrink: 0 }} />
                          )}

                          {block.type === 'divider' ? (
                            <div style={{ flex: 1, height: 2, background: theme.bg, boxShadow: theme.shadowInset, margin: '16px 0' }} />
                          ) : (
                            <div style={{ 
                              flex: 1, position: 'relative', 
                              borderLeft: block.type === 'quote' ? `4px solid ${theme.accent}` : 'none', 
                              paddingLeft: block.type === 'quote' ? 12 : 0,
                              background: block.type === 'code' ? '#171A24' : 'transparent',
                              padding: block.type === 'code' ? 0 : (block.type === 'quote' ? '0 0 0 12px' : 0),
                              borderRadius: block.type === 'code' ? 8 : 0,
                              boxShadow: block.type === 'code' ? theme.shadowInset : 'none'
                            }}>
                              {block.type === 'code' ? (
                                <div style={{ position: 'relative', width: '100%' }}>
                                  <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                                    <select 
                                      value={block.language || 'javascript'} 
                                      onChange={e => {
                                        const newBlocks = [...blocks];
                                        newBlocks[i] = { ...block, language: e.target.value };
                                        setBlocks(newBlocks);
                                      }}
                                      style={{
                                        background: theme.bg, border: 'none', color: theme.textSecondary,
                                        fontSize: 12, padding: '4px 8px', borderRadius: 8,
                                        boxShadow: theme.shadowRaisedSm, outline: 'none', cursor: 'pointer',
                                        fontFamily: fontBody.fontFamily
                                      }}
                                    >
                                      <option value="javascript">JS</option>
                                      <option value="python">Python</option>
                                      <option value="java">Java</option>
                                      <option value="go">Go</option>
                                      <option value="dart">Dart</option>
                                      <option value="json">JSON</option>
                                      <option value="markup">HTML</option>
                                      <option value="css">CSS</option>
                                    </select>
                                  </div>
                                  <Editor
                                    textareaId={`block-${block.id}`}
                                    value={block.content}
                                    onValueChange={code => updateBlock(block.id, code)}
                                    highlight={code => {
                                      const lang = block.language || 'javascript';
                                      const grammar = Prism.languages[lang] || Prism.languages.javascript;
                                      return Prism.highlight(code, grammar, lang);
                                    }}
                                    padding={12}
                                    onFocus={() => setActiveBlockId(block.id)}
                                    onKeyDown={e => handleBlockKeyDown(e, i, block)}
                                    style={{
                                      fontFamily: 'monospace',
                                      fontSize: 14,
                                      background: 'transparent',
                                      outline: 'none',
                                      border: 'none',
                                      minHeight: 80,
                                      color: '#9FE1CB' // Fallback text color if no token match
                                    }}
                                  />
                                </div>
                              ) : (
                                <AutoResizeTextarea
                                  id={`block-${block.id}`}
                                  ref={(el) => blockRefs.current[block.id] = el}
                                  autoFocus={i === blocks.length - 1}
                                  value={block.content}
                                  onChange={e => updateBlock(block.id, e.target.value)}
                                  onKeyDown={e => handleBlockKeyDown(e, i, block)}
                                  onFocus={() => setActiveBlockId(block.id)}
                                  placeholder={activeBlockId === block.id ? (block.type === 'checklist' ? 'List item...' : block.format === 'h1' ? 'Heading 1' : block.format === 'h2' ? 'Heading 2' : block.type === 'quote' ? 'Quote...' : (blocks.length === 1 && i === 0 ? 'Start writing...' : "Type '/' for commands")) : ''}
                                  style={{
                                    width: '100%', background: "transparent", border: "none", outline: "none",
                                    color: block.type === 'quote' ? theme.textSecondary : theme.textPrimary,
                                    fontFamily: activeFontFamily,
                                    fontSize: block.format === 'h1' ? 24 : block.format === 'h2' ? 20 : 16,
                                    fontWeight: block.format === 'h1' ? 800 : block.format === 'h2' ? 700 : 400,
                                    fontStyle: block.type === 'quote' ? 'italic' : 'normal',
                                    lineHeight: block.format === 'h1' ? 1.2 : block.format === 'h2' ? 1.3 : 1.5,
                                    textDecoration: block.checked ? 'line-through' : 'none',
                                    opacity: block.checked ? 0.5 : 1
                                  }}
                                />
                              )}

                              {/* Slash Menu Popover */}
                              <AnimatePresence>
                                {slashMenu.show && slashMenu.blockId === block.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    style={{
                                      position: 'absolute', top: 36, left: 0, background: theme.bg, boxShadow: theme.shadowRaised,
                                      borderRadius: 16, padding: "8px", display: 'flex', flexDirection: 'column', gap: 4, zIndex: 1030,
                                      minWidth: 200, maxHeight: 250, overflowY: 'auto'
                                    }}
                                  >
                                    <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, padding: "4px 8px", textTransform: 'uppercase' }}>Basic Blocks</div>
                                    {slashOptions.filter(opt => opt.label.toLowerCase().includes(slashMenu.search)).map((opt, idx) => {
                                      const isSelected = idx === (slashMenu.selectedIndex || 0);
                                      return (
                                      <button id={`slash-opt-${idx}`} key={opt.id} onClick={() => applySlashCommand(opt)} style={{
                                        display: 'flex', alignItems: 'center', gap: 12, padding: "8px", borderRadius: 12,
                                        background: isSelected ? (theme.bg === '#1A1D24' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent',
                                        boxShadow: isSelected ? theme.shadowInset : 'none',
                                        border: 'none', cursor: 'pointer', color: theme.textPrimary,
                                        textAlign: 'left'
                                      }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary }}>
                                          <opt.icon size={14} />
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</span>
                                      </button>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              )}

              {/* GUIDED PROMPTS FORMS */}
              {activePrompt === 'day' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: activeFontFamily }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: theme.bg, boxShadow: theme.shadowInset, padding: "16px", borderRadius: 20 }}>
                    <span style={{ fontSize: 15, color: theme.textSecondary, fontFamily: activeFontFamily }}>Mood</span>
                    <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
                      {['😞', '😕', '😐', '🙂', '😄'].map((m, i) => (
                        <span key={i} onClick={() => setDayMood(m)} style={{ fontSize: 22, cursor: 'pointer', opacity: dayMood === m ? 1 : 0.4, padding: "4px 8px", borderRadius: 12, background: dayMood === m ? theme.bg : "transparent", boxShadow: dayMood === m ? theme.shadowRaisedSm : "none", transition: 'all 0.2s' }}>{m}</span>
                      ))}
                    </div>
                  </div>
                  <EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="Best part of today..." value={dayBest} onChange={e => setDayBest(e.target.value)} isTextarea />
                  <EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="What drained me..." value={dayDrained} onChange={e => setDayDrained(e.target.value)} isTextarea />
                  <EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="Anything else..." value={dayElse} onChange={e => setDayElse(e.target.value)} isTextarea />
                </div>
              )}

              {activePrompt === 'grateful' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: activeFontFamily }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 12, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent, fontWeight: 700 }}>1</div>
                    <EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="I am grateful for..." value={grateful1} onChange={e => setGrateful1(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 12, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent, fontWeight: 700 }}>2</div>
                    <EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="I am grateful for..." value={grateful2} onChange={e => setGrateful2(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 12, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent, fontWeight: 700 }}>3</div>
                    <EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="I am grateful for..." value={grateful3} onChange={e => setGrateful3(e.target.value)} />
                  </div>
                </div>
              )}

              {activePrompt === 'book' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: activeFontFamily }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 2 }}><EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="Book title" value={bookTitle} onChange={e => setBookTitle(e.target.value)} /></div>
                    <div style={{ flex: 1 }}><EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="Ch. / pg" value={bookCh} onChange={e => setBookCh(e.target.value)} /></div>
                  </div>
                  <EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="Quote or passage..." value={bookQuote} onChange={e => setBookQuote(e.target.value)} isTextarea />
                  <EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="My thoughts..." value={bookThoughts} onChange={e => setBookThoughts(e.target.value)} isTextarea />
                </div>
              )}

              {activePrompt === 'work' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: activeFontFamily }}>
                  <EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="What I built or shipped..." value={workBuilt} onChange={e => setWorkBuilt(e.target.value)} isTextarea />
                  <EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="Blockers hit..." value={workBlockers} onChange={e => setWorkBlockers(e.target.value)} isTextarea />
                  <EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="Decisions made and why..." value={workDecisions} onChange={e => setWorkDecisions(e.target.value)} isTextarea />
                </div>
              )}

              {activePrompt === 'goal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: activeFontFamily }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: theme.bg, boxShadow: theme.shadowInset, padding: "8px 16px", borderRadius: 16 }}>
                    <input
                      type="text"
                      placeholder="Which goal — e.g. Land EU SWE role"
                      value={goalWhich}
                      onChange={e => setGoalWhich(e.target.value)}
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: theme.textPrimary, fontSize: 15, fontFamily: activeFontFamily, padding: "8px 0" }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 120 }}>
                      <div style={{ flex: 1, height: 8, background: theme.bg, boxShadow: theme.shadowInset, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${goalProgress}%`, height: '100%', background: theme.accent, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 13, color: theme.textSecondary, fontWeight: 600 }}>{goalProgress}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}><EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="Wins this week..." value={goalWins} onChange={e => setGoalWins(e.target.value)} isTextarea /></div>
                    <div style={{ flex: 1 }}><EntryInput theme={theme} fontBody={{ fontFamily: activeFontFamily }} placeholder="Blockers / next step..." value={goalBlockers} onChange={e => setGoalBlockers(e.target.value)} isTextarea /></div>
                  </div>
                </div>
              )}

            </div>

            {/* Toolbar */}
            {renderToolbar()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Overlay Indicator (Just for visual flair) */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ width: 80, height: 80, borderRadius: 40, background: theme.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
            >
              <LucideIcons.Mic size={32} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
