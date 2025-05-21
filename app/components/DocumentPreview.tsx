import React from 'react';
import { Textarea } from './ui/textarea';


type Props = {
  content: string;
};
const DocumentPreview: React.FC<Props> = ({ content }) => {
  const handleCopyContent = () => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <textarea  className="min-h-64" readOnly value={content}  />
      <div className='flex justify-between mt-4'>
        <button onClick={handleCopyContent}>Copy to Clipboard</button>
        <button onClick={handleDownload}>Download Document</button>
      </div>
    </div>
  );
};

export default DocumentPreview;
