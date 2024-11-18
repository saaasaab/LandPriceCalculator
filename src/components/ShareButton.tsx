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
      {copied ? 'Copied your work! Now share the link' : 'Share your work'}
    </button>
  );
};

export default ShareButton;