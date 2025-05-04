import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

const TextSelectionToolbox: React.FC = () => {
  const [isToolboxVisible, setIsToolboxVisible] = useState(false);
  const [toolboxPosition, setToolboxPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const toolboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const x = rect.left + rect.width / 2;
          const y = rect.top - 30; // 工具箱高度
          setToolboxPosition({ x, y });
          setIsToolboxVisible(true);
        } else {
          setIsToolboxVisible(false);
        }
      } else {
        setIsToolboxVisible(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const handleBoldClick = () => {
    document.execCommand('bold', false, null);
  };

  const handleItalicClick = () => {
    document.execCommand('italic', false, null);
  };

  return (
    <div className='toolbar-container'>
      {isToolboxVisible && (
        <div
          ref={toolboxRef}
          style={{
            position: 'absolute',
            left: toolboxPosition.x,
            top: toolboxPosition.y,
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            padding: '5px',
          }}
        >
          <button onClick={handleBoldClick}>加粗</button>
          <button onClick={handleItalicClick}>斜体</button>
        </div>
      )}
    </div>
  );
};

export default TextSelectionToolbox;
