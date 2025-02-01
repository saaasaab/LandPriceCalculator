import React from "react";
import './ConfirmationModal.scss';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  message = "Are you sure you want to proceed? This action cannot be undone."
}) => {

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Confirm Action</h3>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="modal-confirm" onClick={onConfirm}>
            Yes, Confirm
          </button>
          <button className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;