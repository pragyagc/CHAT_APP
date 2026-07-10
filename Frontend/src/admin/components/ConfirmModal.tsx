type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <p style={{ marginBottom: 20, fontSize: 15 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={onCancel}>Cancel</button>
          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
