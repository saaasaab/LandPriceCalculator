import { useState } from 'react';
import { copyToClipboard } from '../utils/utils';
import './ShareButton.scss';

const ShareButton = ({ params }: { params: any }) => {
  const [copied, setCopied] = useState(false);


  const initiatePrinting = () => {
    window.print();
  }


  return (

    <div className={"action-buttons"}>
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
        className={`copy-url-button `}
      >
        Print
      </button>

    </div>

  );
};

export default ShareButton;