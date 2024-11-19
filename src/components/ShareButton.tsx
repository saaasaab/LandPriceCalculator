import { useState } from 'react';
import { copyToClipboard } from '../utils/utils';
import './ShareButton.scss';

const ShareButton = ({params}:{params:any}) => {
  const [copied, setCopied] = useState(false);


  return (

    <button
      onClick={() => copyToClipboard(params, setCopied)}
      className={`copy-url-button ${copied ? 'copied' : ''}`}
    >
      {copied ? 'Copied the analysis! Now share the link' : 'Share'}
    </button>
  );
};

export default ShareButton;