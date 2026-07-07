import '../../styles/layout.css';

/**
 * Signature vertical dotted spine on the far left edge.
 * pointer-events: none so it never blocks touches.
 */
export default function SpineDecoration() {
  const dots = Array.from({ length: 60 });
  return (
    <div className="spine" aria-hidden="true">
      {dots.map((_, i) => <div key={i} className="spine-dot" />)}
    </div>
  );
}
