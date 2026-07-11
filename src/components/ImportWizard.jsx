import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, X } from 'lucide-react';
import { detectApp, parseYNAB, parseMint, parseTodoist } from '../utils/importParsers.js';

export default function ImportWizard({ theme, fontDisplay, fontBody, NeoSurface, PrimaryButton, onClose, onImportTodos, onImportExpenses }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [detectedApp, setDetectedApp] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError('');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const app = detectApp(text, selectedFile.name);
      setDetectedApp(app);
      
      let result;
      if (app === 'YNAB') result = parseYNAB(text);
      else if (app === 'Mint') result = parseMint(text);
      else if (app === 'Todoist') result = parseTodoist(text);
      else {
        setError('Format not recognized. Only YNAB CSV, Mint CSV, and Todoist JSON are supported offline currently.');
        setStep(1);
        return;
      }
      
      if (result.error) {
        setError(result.error);
        setStep(1);
      } else {
        setParsedData(result);
        setStep(2);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleConfirm = () => {
    if (!parsedData) return;
    
    if (parsedData.type === 'todos') {
      onImportTodos(parsedData.data);
    } else if (parsedData.type === 'expenses') {
      onImportExpenses(parsedData.data);
    }
    
    setStep(3);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '90%', maxWidth: 400, background: theme.bg, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: 22, color: theme.textPrimary, margin: 0, ...fontDisplay }}>Import Data</h2>
        
        {step === 1 && (
          <>
            <p style={{ color: theme.textSecondary, fontSize: 14, margin: 0, ...fontBody }}>
              Upload your export file. We currently support <b>YNAB (CSV)</b>, <b>Mint (CSV)</b>, and <b>Todoist (JSON)</b> directly on your device.
            </p>
            
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".csv,.json" style={{ display: 'none' }} />
            
            <NeoSurface onClick={() => fileInputRef.current?.click()} style={{ padding: '40px 20px', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', border: `2px dashed ${theme.border}` }}>
              <UploadCloud size={32} color={theme.accent} />
              <span style={{ color: theme.textPrimary, fontWeight: 600, ...fontBody }}>Tap to select file</span>
              <span style={{ color: theme.textSecondary, fontSize: 12, ...fontBody }}>.csv or .json only</span>
            </NeoSurface>
            
            {error && (
              <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, ...fontBody }}>
                <AlertTriangle size={16} /> {error}
              </div>
            )}
          </>
        )}

        {step === 2 && parsedData && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: theme.pressed, borderRadius: 16 }}>
              <FileText size={24} color={theme.accent} />
              <div>
                <div style={{ fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Detected: {detectedApp}</div>
                <div style={{ fontSize: 13, color: theme.textSecondary, ...fontBody }}>Found {parsedData.data.length} valid items out of {parsedData.rawCount} rows</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 150, overflowY: 'auto' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, ...fontBody }}>PREVIEW (FIRST 3)</div>
              {parsedData.data.slice(0, 3).map((item, idx) => (
                <NeoSurface key={idx} style={{ padding: 12, borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: theme.textPrimary, ...fontBody, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {parsedData.type === 'todos' ? item.text : `${item.currency} ${item.amount}`}
                  </div>
                  <div style={{ fontSize: 12, color: theme.textSecondary, ...fontBody }}>
                    {parsedData.type === 'todos' ? `Due: ${item.due || 'None'}` : `${item.date} · ${item.note}`}
                  </div>
                </NeoSurface>
              ))}
            </div>
            
            <PrimaryButton onClick={handleConfirm} style={{ width: '100%', marginTop: 10 }}>
              Import {parsedData.data.length} items
            </PrimaryButton>
          </>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
            <CheckCircle size={48} color={theme.accent2} />
            <h3 style={{ margin: 0, color: theme.textPrimary, ...fontDisplay }}>Import Complete!</h3>
            <p style={{ margin: 0, color: theme.textSecondary, textAlign: 'center', ...fontBody }}>
              Successfully imported {parsedData.data.length} {parsedData.type === 'todos' ? 'tasks' : 'expenses'}.
            </p>
            <PrimaryButton onClick={onClose} style={{ width: '100%', marginTop: 20 }}>
              Done
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
