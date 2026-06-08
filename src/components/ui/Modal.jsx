import "./Modal.css";

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
}) {
  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={onClose}
      />

      <div className="modal-container">
        <div className="modal-header">
          <h2>{title}</h2>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}