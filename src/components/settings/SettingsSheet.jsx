import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { exportAllData, importAllData, estimateStorageBytes } from '../../hooks/useStorage.js';
import { STORAGE_WARN_BYTES } from '../../constants/theme.js';
import { getLocalDateString } from '../../utils/date.js';
import Icon from '../ui/Icon.jsx';

/**
 * Settings slide-up sheet.
 * Contains: relocation goal fields, weekly budget, export/import, clear data.
 */
export default function SettingsSheet({ settings, onUpdate, onClose }) {
  const [goal, setGoal]         = useState(String(settings.relocationGoalAmount));
  const [saved, setSaved]       = useState(String(settings.relocationSavedAmount));
  const [targetDate, setTarget] = useState(settings.relocationTargetDate || '');
  const [budget, setBudget]     = useState(String(settings.weeklyBudget));
  const [status, setStatus]     = useState('');

  const handleSave = () => {
    onUpdate({
      relocationGoalAmount: parseFloat(goal) || 0,
      relocationSavedAmount: parseFloat(saved) || 0,
      relocationTargetDate: targetDate,
      weeklyBudget: parseFloat(budget) || 0,
    });
    onClose();
  };

  const handleExport = async () => {
    try {
      setStatus('Exporting…');
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const fileName = `konto-backup-${getLocalDateString()}.json`;

      // Write to a temp file, then share
      await Filesystem.writeFile({
        path: fileName,
        data: json,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      const { uri } = await Filesystem.getUri({
        directory: Directory.Cache,
        path: fileName,
      });

      await Share.share({
        title: 'Konto Backup',
        text: 'Your Konto data export',
        url: uri,
        dialogTitle: 'Save or share Konto backup',
      });

      setStatus('Exported ✓');
    } catch (err) {
      console.error('Export failed:', err);
      setStatus(`Export failed: ${err.message}`);
    }
  };

  const handleImport = async () => {
    try {
      // Use a hidden file input for web/browser; on native Capacitor uses the platform picker
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        const data = JSON.parse(text);
        await importAllData(data);
        setStatus('Imported ✓ — please restart the app');
      };
      input.click();
    } catch (err) {
      setStatus(`Import failed: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    // Hard confirm for bulk destructive action (exception to no-confirm-dialog rule)
    if (!window.confirm('Delete ALL Konto data? This cannot be undone.')) return;
    await Preferences.clear();
    window.location.reload();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="sheet-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span className="sheet-title">Settings</span>
          <div style={{ display: 'flex' }}>
            <button className="btn-text" onClick={onClose} id="btn-settings-cancel">Cancel</button>
            <button className="btn-text btn-text-primary" onClick={handleSave} id="btn-settings-save">Save</button>
          </div>
        </div>

        <div className="sheet-body">
          {/* Relocation */}
          <p className="eyebrow" style={{ marginBottom: 16 }}>Relocation</p>

          <div className="field">
            <label className="field-label" htmlFor="settings-goal">Goal amount (₹)</label>
            <input
              id="settings-goal"
              className="field-input field-input-mono"
              type="number"
              inputMode="numeric"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="500000"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="settings-saved">Amount saved so far (₹)</label>
            <input
              id="settings-saved"
              className="field-input field-input-mono"
              type="number"
              inputMode="numeric"
              value={saved}
              onChange={(e) => setSaved(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="settings-target-date">Target relocation date</label>
            <input
              id="settings-target-date"
              className="field-input field-input-mono"
              type="date"
              value={targetDate}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>

          {/* Budget */}
          <p className="eyebrow" style={{ marginBottom: 16, marginTop: 8 }}>Budget</p>

          <div className="field">
            <label className="field-label" htmlFor="settings-budget">Weekly budget (₹)</label>
            <input
              id="settings-budget"
              className="field-input field-input-mono"
              type="number"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="5000"
            />
          </div>

          {/* Data */}
          <p className="eyebrow" style={{ marginBottom: 12, marginTop: 8 }}>Data</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div
              style={{
                borderTop: '1px solid var(--divider-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)' }}>
                Export backup
              </span>
              <button
                className="btn-text btn-text-primary"
                onClick={handleExport}
                id="btn-export"
                style={{ minHeight: 0, fontSize: 14 }}
              >
                Export JSON
              </button>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--divider-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)' }}>
                Import backup
              </span>
              <button
                className="btn-text btn-text-primary"
                onClick={handleImport}
                id="btn-import"
                style={{ minHeight: 0, fontSize: 14 }}
              >
                Import JSON
              </button>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--divider-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--priority-high)', fontFamily: 'var(--font-serif)' }}>
                Clear all data
              </span>
              <button
                className="btn-text btn-text-danger"
                onClick={handleClearAll}
                id="btn-clear-all"
                style={{ minHeight: 0, fontSize: 14 }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Status */}
          {status && (
            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)' }}>
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
