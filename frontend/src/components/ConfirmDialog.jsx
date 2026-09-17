import Modal from './Modal';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger }) {
  return (
    <Modal title={title} onClose={onCancel} width="400px">
      <p>{message}</p>
      <div style={{ display: 'flex', gap: '0.6em', justifyContent: 'flex-end', marginTop: '1.2em' }}>
        <button className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
