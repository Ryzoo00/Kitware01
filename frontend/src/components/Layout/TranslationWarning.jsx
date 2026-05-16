import { useState, useEffect } from 'react';

const TranslationWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('translationWarningDismissed') === 'true';
  });

  useEffect(() => {
    // Check for translation extension interference
    const checkTranslation = () => {
      const paths = document.querySelectorAll('path');
      let hasCorruption = false;
      
      paths.forEach(path => {
        const d = path.getAttribute('d');
        if (d && d.includes('tc')) {
          hasCorruption = true;
        }
      });
      
      if (hasCorruption && !dismissed) {
        setShowWarning(true);
      }
    };
    
    // Check after a delay
    const timer = setTimeout(checkTranslation, 2000);
    
    return () => clearTimeout(timer);
  }, [dismissed]);

  const handleDismiss = () => {
    setShowWarning(false);
    setDismissed(true);
    localStorage.setItem('translationWarningDismissed', 'true');
  };

  if (!showWarning || dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      maxWidth: '400px',
      background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      color: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
          ⚠️ Translation Extension Detected
        </h3>
        <button
          onClick={handleDismiss}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>
      
      <p style={{ margin: '0 0 15px 0', lineHeight: '1.5' }}>
        Google Translate / DeepL is corrupting SVG icons and causing console errors.
      </p>
      
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <strong style={{ display: 'block', marginBottom: '10px' }}>Quick Fix Options:</strong>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>Option 1 (Recommended):</strong>
          <div style={{ fontSize: '14px', marginTop: '5px' }}>
            Press <kbd style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '3px' }}>Ctrl</kbd> + <kbd style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '3px' }}>Shift</kbd> + <kbd style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '3px' }}>N</kbd> for Incognito Mode
          </div>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>Option 2:</strong>
          <div style={{ fontSize: '14px', marginTop: '5px' }}>
            Disable translation extension for localhost:3000
            <br/>
            <code style={{ background: 'rgba(0,0,0,0.2)', padding: '3px 6px', borderRadius: '3px', display: 'inline-block', marginTop: '5px' }}>
              chrome://extensions/
            </code>
          </div>
        </div>
      </div>
      
      <div style={{ fontSize: '12px', opacity: 0.8, fontStyle: 'italic' }}>
        ℹ️ This warning won't show again after dismissal
      </div>
    </div>
  );
};

export default TranslationWarning;
