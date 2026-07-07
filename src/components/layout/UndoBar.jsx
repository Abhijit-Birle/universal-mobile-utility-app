import { useEffect, useRef } from 'react';
import '../../styles/layout.css';

/**
 * Slide-up undo bar with a 5-second countdown progress strip.
 * Auto-dismisses after 5 seconds.
 */
export default function UndoBar({ message, onUndo, onDismiss }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timerRef.current);
  }, [onDismiss]);

  const handleUndo = () => {
    clearTimeout(timerRef.current);
    onUndo();
  };

  return (
    <div className="undo-bar" role="status" aria-live="polite">
      <span className="undo-bar-text">{message}</span>
      <button className="undo-action" onClick={handleUndo} id="btn-undo">
        Undo
      </button>
      <div className="undo-bar-progress" />
    </div>
  );
}
