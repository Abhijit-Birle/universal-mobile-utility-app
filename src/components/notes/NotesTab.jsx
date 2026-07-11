import React, { useState, useMemo } from 'react';
import * as LucideIcons from "lucide-react";
import { useAsyncStorage } from "../../hooks/useAsyncStorage.js";
import JournalEntry from "../JournalEntry.jsx";

export default function NotesTab({ theme, fontDisplay, fontBody, NeoSurface, NeoInput }) {
  const [folders, setFolders] = useAsyncStorage("neo_folders", []);
  const [entries, setEntries] = useAsyncStorage("neo_journal_entries", []);

  // 'folder-list' | 'editor'
  const [viewState, setViewState] = useState('folder-list');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  // Folder modal state (Create / Edit)
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState('create'); // 'create' or 'edit'
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#aa3bff");
  const [newFolderParentId, setNewFolderParentId] = useState(null);
  
  // Note move modal state
  const [showMoveNote, setShowMoveNote] = useState(false);
  const [noteToMove, setNoteToMove] = useState(null);

  // Deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);

  // Aggregation helper
  const getFolderStats = (folderId) => {
    const isTopLevel = folders.find(f => f.id === folderId)?.parentFolderId === null;
    let subfolderIds = [];
    if (isTopLevel) {
      subfolderIds = folders.filter(f => f.parentFolderId === folderId).map(f => f.id);
    }
    const relevantFolderIds = [folderId, ...subfolderIds];
    const notesCount = entries.filter(e => relevantFolderIds.includes(e.folderId)).length;
    return { notesCount, subfoldersCount: subfolderIds.length };
  };

  const handleSaveFolder = () => {
    if (!newFolderName.trim()) return;
    
    if (folderModalMode === 'edit') {
      setFolders(prev => prev.map(f => f.id === editingFolderId ? { ...f, name: newFolderName.trim(), color: newFolderColor, parentFolderId: newFolderParentId } : f).sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      const folder = {
        id: `folder_${Date.now()}`,
        name: newFolderName.trim(),
        color: newFolderColor,
        parentFolderId: newFolderParentId,
        createdAt: Date.now()
      };
      setFolders(prev => [...prev, folder].sort((a, b) => a.name.localeCompare(b.name)));
    }
    
    setShowFolderModal(false);
    setNewFolderName("");
    setNewFolderParentId(null);
    setEditingFolderId(null);
  };

  const openCreateFolder = (parentId = null) => {
    setFolderModalMode('create');
    setNewFolderName("");
    setNewFolderColor("#aa3bff");
    setNewFolderParentId(parentId);
    setEditingFolderId(null);
    setShowFolderModal(true);
  };

  const openEditFolder = (folder) => {
    setFolderModalMode('edit');
    setNewFolderName(folder.name);
    setNewFolderColor(folder.color);
    setNewFolderParentId(folder.parentFolderId);
    setEditingFolderId(folder.id);
    setShowFolderModal(true);
  };

  const handleDeleteFolder = (folderId) => {
    setFolderToDelete(folderId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteFolder = (cascade) => {
    if (!folderToDelete) return;
    
    // Find all subfolders to delete if it's a top-level
    const subfolders = folders.filter(f => f.parentFolderId === folderToDelete).map(f => f.id);
    const foldersToRemove = [folderToDelete, ...subfolders];

    // Remove folders
    setFolders(prev => prev.filter(f => !foldersToRemove.includes(f.id)));

    // Handle notes
    if (cascade) {
      setEntries(prev => prev.filter(e => !foldersToRemove.includes(e.folderId)));
    } else {
      setEntries(prev => prev.map(e => foldersToRemove.includes(e.folderId) ? { ...e, folderId: null } : e));
    }

    setShowDeleteConfirm(false);
    setFolderToDelete(null);
    setViewState('folder-list');
  };

  const handleMoveNote = (folderId) => {
    if (!noteToMove) return;
    setEntries(prev => prev.map(e => e.id === noteToMove ? { ...e, folderId } : e));
    setShowMoveNote(false);
    setNoteToMove(null);
  };

  const getExcerpt = (entry) => {
    if (entry.mode === 'free' && entry.data.blocks) {
      const texts = entry.data.blocks.map(b => b.content).filter(Boolean);
      return texts.join(' ').substring(0, 80) || "Empty note";
    }
    return "Guided Entry";
  };

  // --- UI Components ---

  const folderCardStyle = {
    background: theme.bg,
    boxShadow: theme.shadowRaised,
    borderRadius: 16,
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    cursor: 'pointer',
    marginBottom: 12
  };

  const NoteCard = ({ entry, showFolderBadge = true }) => (
    <div 
      onClick={() => { setEditingEntry(entry); setCurrentFolderId(entry.folderId); setViewState('editor'); }}
      style={{
        background: theme.bg, boxShadow: theme.shadowRaisedSm, borderRadius: 16, padding: 16, marginBottom: 12, cursor: 'pointer',
        borderLeft: entry.mode === 'guided' ? `3px solid ${theme.accent}` : 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.textSecondary, ...fontBody }}>
          {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setNoteToMove(entry.id); setShowMoveNote(true); }}
          style={{ background: 'transparent', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}
        >
          <LucideIcons.FolderSymlink size={16} />
        </button>
      </div>
      <div style={{ fontSize: 15, color: theme.textPrimary, ...fontBody, lineHeight: 1.5, opacity: 0.9 }}>
        {getExcerpt(entry)}
      </div>
      {showFolderBadge && entry.folderId && (
        <div style={{ 
          marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 4, 
          background: theme.pageBg, padding: '4px 8px', borderRadius: 8, 
          fontSize: 11, color: theme.textSecondary, ...fontBody 
        }}>
          <LucideIcons.Folder size={12} />
          {folders.find(f => f.id === entry.folderId)?.name || 'Unknown'}
        </div>
      )}
    </div>
  );

  // --- Screens ---
  let mainContent = null;

  if (viewState === 'editor') {
    mainContent = (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px 0', flexShrink: 0 }}>
          <button 
            onClick={() => { setEditingEntry(null); setViewState('folder-list'); }}
            style={{ background: 'transparent', border: 'none', color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontFamily: fontBody.fontFamily }}
          >
            <LucideIcons.ArrowLeft size={18} /> Back
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <JournalEntry 
            theme={theme} 
            fontDisplay={fontDisplay} 
            fontBody={fontBody} 
            NeoSurface={NeoSurface} 
            folderId={currentFolderId === 'all' ? null : currentFolderId}
            initialEntry={editingEntry}
            onSaved={(entryData) => {
              if (entryData) {
                if (editingEntry) {
                  setEntries(prev => prev.map(e => e.id === editingEntry.id ? entryData : e));
                } else {
                  setEntries(prev => [entryData, ...prev]);
                }
              }
              setEditingEntry(null);
              setViewState('folder-list');
            }}
          />
        </div>
      </div>
    );
  } else {
    // viewState is 'folder-list'
    const topLevelFolders = folders.filter(f => f.parentFolderId === null);
    const allNotesExpanded = !!expandedFolders['all'];
    const uncategorizedExpanded = !!expandedFolders['uncategorized'];

    // Action Menu Helper
    const renderActionMenu = (folder) => {
      if (activeActionMenuId !== folder.id) return null;
      return (
        <div style={{
          position: 'absolute', top: 40, right: 16, background: theme.bg, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: 12, padding: 8, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140
        }}>
          {folder.parentFolderId === null && (
            <button 
              onClick={(e) => { e.stopPropagation(); openCreateFolder(folder.id); setActiveActionMenuId(null); }}
              style={{ background: 'transparent', border: 'none', padding: '8px 12px', textAlign: 'left', fontSize: 13, color: theme.textPrimary, ...fontBody, borderRadius: 8, cursor: 'pointer' }}
            >
              New Subfolder
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); openEditFolder(folder); setActiveActionMenuId(null); }}
            style={{ background: 'transparent', border: 'none', padding: '8px 12px', textAlign: 'left', fontSize: 13, color: theme.textPrimary, ...fontBody, borderRadius: 8, cursor: 'pointer' }}
          >
            Edit Folder
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); setActiveActionMenuId(null); }}
            style={{ background: 'transparent', border: 'none', padding: '8px 12px', textAlign: 'left', fontSize: 13, color: '#ff4d4d', ...fontBody, borderRadius: 8, cursor: 'pointer' }}
          >
            Delete Folder
          </button>
        </div>
      );
    };

    mainContent = (
      <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto', position: 'relative' }} onClick={() => setActiveActionMenuId(null)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Notes</div>
          <button 
            onClick={() => openCreateFolder(null)}
            style={{ width: 40, height: 40, borderRadius: 20, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: theme.accent, cursor: 'pointer' }}
          >
            <LucideIcons.FolderPlus size={20} />
          </button>
        </div>

        {/* All Notes */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...folderCardStyle, marginBottom: 0 }} onClick={() => setExpandedFolders(prev => ({ ...prev, all: !prev.all }))}>
             <div style={{ width: 40, height: 40, borderRadius: 12, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary }}>
               <LucideIcons.Files size={20} />
             </div>
             <div style={{ flex: 1 }}>
               <div style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>All Notes</div>
               <div style={{ fontSize: 13, color: theme.textSecondary, ...fontBody }}>{entries.length} notes</div>
             </div>
             <div style={{ padding: 8, display: 'flex', alignItems: 'center' }}>
               {allNotesExpanded ? <LucideIcons.ChevronDown size={18} color={theme.textSecondary} /> : <LucideIcons.ChevronRight size={18} color={theme.textSecondary} />}
             </div>
          </div>
          {allNotesExpanded && (
            <div style={{ paddingLeft: 32, marginTop: 12, display: 'flex', flexDirection: 'column' }}>
              {entries.sort((a,b) => new Date(b.date) - new Date(a.date)).map(entry => <NoteCard key={entry.id} entry={entry} showFolderBadge={true} />)}
            </div>
          )}
        </div>

        {/* Top Level Folders */}
        {topLevelFolders.map(folder => {
          const stats = getFolderStats(folder.id);
          const isExpanded = !!expandedFolders[folder.id];
          const subfolders = folders.filter(f => f.parentFolderId === folder.id).sort((a,b) => a.name.localeCompare(b.name));
          const folderEntries = entries.filter(e => e.folderId === folder.id).sort((a,b) => new Date(b.date) - new Date(a.date));

          return (
            <div key={folder.id} style={{ marginBottom: 16 }}>
              <div style={{ ...folderCardStyle, marginBottom: 0, position: 'relative' }} onClick={() => setExpandedFolders(prev => ({ ...prev, [folder.id]: !prev[folder.id] }))}>
                 <div style={{ width: 40, height: 40, borderRadius: 12, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: 'flex', alignItems: 'center', justifyContent: 'center', color: folder.color }}>
                   <LucideIcons.Folder size={20} />
                 </div>
                 <div style={{ flex: 1 }}>
                   <div style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>{folder.name}</div>
                   <div style={{ fontSize: 13, color: theme.textSecondary, ...fontBody }}>
                     {stats.subfoldersCount > 0 ? `${stats.subfoldersCount} folders, ` : ''}{stats.notesCount} notes
                   </div>
                 </div>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setActiveActionMenuId(prev => prev === folder.id ? null : folder.id); }}
                   style={{ background: 'transparent', border: 'none', padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                 >
                   <LucideIcons.MoreVertical size={18} color={theme.textSecondary} />
                 </button>
                 {renderActionMenu(folder)}
              </div>
              
              {/* Nested Content */}
              {isExpanded && (
                <div style={{ paddingLeft: 32, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 0 }}>
                  
                  {/* Create note button for this folder */}
                  <div 
                    onClick={() => { setEditingEntry(null); setCurrentFolderId(folder.id); setViewState('editor'); }}
                    style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', color: theme.accent, marginBottom: 12 }}
                  >
                    <LucideIcons.PlusCircle size={18} />
                    <span style={{ fontSize: 14, fontWeight: 600, ...fontBody }}>Create Note Here</span>
                  </div>

                  {subfolders.map(sub => {
                    const subStats = getFolderStats(sub.id);
                    const subExpanded = !!expandedFolders[sub.id];
                    const subEntries = entries.filter(e => e.folderId === sub.id).sort((a,b) => new Date(b.date) - new Date(a.date));
                    
                    return (
                      <div key={sub.id} style={{ marginBottom: 12 }}>
                        <div style={{ ...folderCardStyle, marginBottom: 0, padding: 12, position: 'relative' }} onClick={() => setExpandedFolders(prev => ({ ...prev, [sub.id]: !prev[sub.id] }))}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: theme.bg, boxShadow: theme.shadowRaisedSm, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub.color }}>
                             <LucideIcons.CornerDownRight size={16} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>{sub.name}</div>
                            <div style={{ fontSize: 12, color: theme.textSecondary, ...fontBody }}>{subStats.notesCount} notes</div>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveActionMenuId(prev => prev === sub.id ? null : sub.id); }}
                            style={{ background: 'transparent', border: 'none', padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <LucideIcons.MoreVertical size={16} color={theme.textSecondary} />
                          </button>
                          {renderActionMenu(sub)}
                        </div>

                        {subExpanded && (
                          <div style={{ paddingLeft: 24, marginTop: 12, display: 'flex', flexDirection: 'column' }}>
                            <div 
                              onClick={() => { setEditingEntry(null); setCurrentFolderId(sub.id); setViewState('editor'); }}
                              style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', color: theme.accent, marginBottom: 12 }}
                            >
                              <LucideIcons.PlusCircle size={16} />
                              <span style={{ fontSize: 13, fontWeight: 600, ...fontBody }}>Create Note Here</span>
                            </div>
                            {subEntries.map(entry => <NoteCard key={entry.id} entry={entry} showFolderBadge={false} />)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {folderEntries.map(entry => <NoteCard key={entry.id} entry={entry} showFolderBadge={false} />)}
                </div>
              )}
            </div>
          );
        })}

        {/* Uncategorized */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...folderCardStyle, marginTop: 8, marginBottom: 0 }} onClick={() => setExpandedFolders(prev => ({ ...prev, uncategorized: !prev.uncategorized }))}>
             <div style={{ width: 40, height: 40, borderRadius: 12, background: theme.bg, boxShadow: theme.shadowInset, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary }}>
               <LucideIcons.Archive size={20} />
             </div>
             <div style={{ flex: 1 }}>
               <div style={{ fontSize: 16, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Uncategorized</div>
               <div style={{ fontSize: 13, color: theme.textSecondary, ...fontBody }}>
                 {entries.filter(e => !e.folderId).length} notes
               </div>
             </div>
             <div style={{ padding: 8, display: 'flex', alignItems: 'center' }}>
               {uncategorizedExpanded ? <LucideIcons.ChevronDown size={18} color={theme.textSecondary} /> : <LucideIcons.ChevronRight size={18} color={theme.textSecondary} />}
             </div>
          </div>
          {uncategorizedExpanded && (
            <div style={{ paddingLeft: 32, marginTop: 12, display: 'flex', flexDirection: 'column' }}>
              {entries.filter(e => !e.folderId).sort((a,b) => new Date(b.date) - new Date(a.date)).map(entry => <NoteCard key={entry.id} entry={entry} showFolderBadge={false} />)}
            </div>
          )}
        </div>

        <button
          onClick={() => { setEditingEntry(null); setCurrentFolderId(null); setViewState('editor'); }}
          style={{
            position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
            background: theme.accent, color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer', zIndex: 100
          }}
        >
          <LucideIcons.PenLine size={24} />
        </button>

      </div>
    );
  }

  // --- Layout ---
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {mainContent}

      {/* Create / Edit Folder Modal */}
      {showFolderModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: theme.bg, borderRadius: 24, width: "100%", maxWidth: 400, padding: 24, boxShadow: theme.shadowRaised }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay, marginBottom: 16 }}>
              {folderModalMode === 'edit' ? 'Edit Folder' : newFolderParentId ? 'New Subfolder' : 'New Folder'}
            </div>
            
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginBottom: 4, ...fontBody }}>FOLDER NAME</div>
            <NeoInput 
              placeholder="e.g., Tech Notes" 
              value={newFolderName} 
              onChange={(e) => setNewFolderName(e.target.value)} 
            />

            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginBottom: 8, marginTop: 16, ...fontBody }}>COLOR</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {["#aa3bff", "#ff4d4d", "#00d084", "#0693e3", "#ff9900", "#eb144c"].map(c => (
                <div 
                  key={c}
                  onClick={() => setNewFolderColor(c)}
                  style={{ 
                    width: 32, height: 32, borderRadius: 16, background: c, cursor: 'pointer',
                    boxShadow: newFolderColor === c ? `0 0 0 3px ${theme.bg}, 0 0 0 5px ${theme.accent}` : 'none'
                  }}
                />
              ))}
            </div>

            {!newFolderParentId && folderModalMode === 'create' && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, marginBottom: 8, ...fontBody }}>NEST INSIDE (OPTIONAL)</div>
                <select 
                  value={newFolderParentId || ""}
                  onChange={(e) => setNewFolderParentId(e.target.value || null)}
                  style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', background: theme.pageBg, color: theme.textPrimary, ...fontBody, outline: 'none' }}
                >
                  <option value="">Top Level (No Parent)</option>
                  {folders.filter(f => f.parentFolderId === null).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowFolderModal(false)} style={{ flex: 1, background: "transparent", color: theme.textSecondary, border: "none", padding: "14px", borderRadius: 14, fontWeight: 600, ...fontBody }}>Cancel</button>
              <button 
                onClick={handleSaveFolder}
                style={{ flex: 1, background: theme.accent, color: "#fff", border: "none", padding: "14px", borderRadius: 14, fontWeight: 600, ...fontBody, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
              >
                {folderModalMode === 'edit' ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Folder Confirm */}
      {showDeleteConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: theme.bg, borderRadius: 24, width: "100%", maxWidth: 400, padding: 24, boxShadow: theme.shadowRaised }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay, marginBottom: 12 }}>Delete Folder</div>
            <div style={{ fontSize: 15, color: theme.textSecondary, ...fontBody, marginBottom: 24, lineHeight: 1.5 }}>
              Do you want to delete all notes inside this folder, or keep them as Uncategorized?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button 
                onClick={() => confirmDeleteFolder(true)}
                style={{ background: "#ff4d4d", color: "#fff", border: "none", padding: "14px", borderRadius: 14, fontWeight: 600, ...fontBody }}
              >
                Delete Folder & Notes
              </button>
              <button 
                onClick={() => confirmDeleteFolder(false)}
                style={{ background: theme.pageBg, color: theme.textPrimary, border: "none", padding: "14px", borderRadius: 14, fontWeight: 600, ...fontBody }}
              >
                Keep Notes (Uncategorized)
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                style={{ background: "transparent", color: theme.textSecondary, border: "none", padding: "14px", borderRadius: 14, fontWeight: 600, ...fontBody }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Note Modal */}
      {showMoveNote && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: theme.bg, borderRadius: 24, width: "100%", maxWidth: 400, padding: 24, boxShadow: theme.shadowRaised, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay, marginBottom: 16 }}>Move Note To...</div>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
              <button 
                onClick={() => handleMoveNote(null)}
                style={{ padding: 12, borderRadius: 12, border: 'none', background: theme.pageBg, color: theme.textPrimary, ...fontBody, textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <LucideIcons.Archive size={16} /> Uncategorized
              </button>
              
              {folders.filter(f => f.parentFolderId === null).map(topFolder => (
                <React.Fragment key={topFolder.id}>
                  <button 
                    onClick={() => handleMoveNote(topFolder.id)}
                    style={{ padding: 12, borderRadius: 12, border: 'none', background: theme.pageBg, color: theme.textPrimary, ...fontBody, textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <LucideIcons.Folder size={16} color={topFolder.color} /> {topFolder.name}
                  </button>
                  {folders.filter(f => f.parentFolderId === topFolder.id).map(subFolder => (
                    <button 
                      key={subFolder.id}
                      onClick={() => handleMoveNote(subFolder.id)}
                      style={{ padding: 12, paddingLeft: 40, borderRadius: 12, border: 'none', background: 'transparent', color: theme.textPrimary, ...fontBody, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      <LucideIcons.Folder size={16} color={subFolder.color} /> {subFolder.name}
                    </button>
                  ))}
                </React.Fragment>
              ))}
            </div>

            <button onClick={() => setShowMoveNote(false)} style={{ marginTop: 16, background: "transparent", color: theme.textSecondary, border: "none", padding: "14px", borderRadius: 14, fontWeight: 600, ...fontBody }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
