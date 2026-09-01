import { X } from 'lucide-react';
import './index.css';

export default function SettingsModal({ onClose, settings, onSettingsChange }) {
  const handleFontSizeChange = (e) => {
    onSettingsChange({ ...settings, fontSize: parseInt(e.target.value, 10) });
  };

  const handleThemeChange = (e) => {
    onSettingsChange({ ...settings, theme: e.target.value });
  };

  return (
    <div className="settings-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="settings-modal" style={{
        backgroundColor: 'var(--bg-panel)', padding: '24px',
        borderRadius: '8px', width: '400px', maxWidth: '90%',
        border: '1px solid var(--border-color)', position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute', top: '16px', right: '16px', 
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer' 
          }}
        >
          <X size={20} />
        </button>
        
        <h2 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>Terminal Settings</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
            Font Size ({settings.fontSize}px)
          </label>
          <input 
            type="range" 
            min="10" 
            max="24" 
            value={settings.fontSize} 
            onChange={handleFontSizeChange}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
            Theme
          </label>
          <select 
            value={settings.theme} 
            onChange={handleThemeChange}
            style={{ 
              width: '100%', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)',
              color: 'var(--text-main)', border: '1px solid var(--border-color)',
              borderRadius: '4px', cursor: 'pointer'
            }}
          >
            <option value="dark">Dark (Default)</option>
            <option value="light">Light</option>
            <option value="ocean">Ocean Blue</option>
            <option value="dracula">Dracula</option>
          </select>
        </div>

        <button 
          onClick={onClose}
          style={{
            width: '100%', padding: '10px', backgroundColor: 'var(--accent-color)',
            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
