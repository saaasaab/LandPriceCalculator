import { useState } from 'react';
import { copyToClipboard } from '../utils/utils';
import './ShareButton.scss';

interface ShareButtonProps {
  params: any;
  showTotalValues?: boolean;
  onToggleTotalValues?: () => void;
}

const ShareButton = ({ params, showTotalValues = false, onToggleTotalValues }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const initiatePrinting = () => {
    window.print();
  }

  return (
    <div className="action-buttons">
      {onToggleTotalValues && (
        <button
          onClick={onToggleTotalValues}
          className="toggle-values-button"
        >
          Show {showTotalValues ? 'Per SQFT' : 'Total'} Values
        </button>
      )}
      <button
        onClick={() => copyToClipboard(params, setCopied)}
        className={`copy-url-button ${copied ? 'copied' : ''}`}
      >
        {copied ? 'Copied the analysis! Now share the link' : 'Share'}
      </button>
      <button
        onClick={() => {
          initiatePrinting()
        }}
        className="copy-url-button"
      >
        Print
      </button>
    </div>
  );
};

export default ShareButton;