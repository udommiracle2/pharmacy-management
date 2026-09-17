import './Modal.css';

export default function Modal({ title, onClose, children, width }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal-panel"
        style={width ? { maxWidth: width } : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
