// DataModeToggle component - allows switching between localStorage and API mode

import React, { useState } from 'react';
import { appConfig, setDataMode, type DataMode } from '../config/app.config';
import '../styles/DataModeToggle.css';

const DataModeToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentMode = appConfig.dataMode;

  const handleModeChange = (mode: DataMode) => {
    if (mode === currentMode) {
      setIsOpen(false);
      return;
    }

    const confirmMessage =
      mode === 'localStorage'
        ? 'Switch to localStorage mode? The app will reload and use local browser storage.'
        : 'Switch to API mode? The app will reload and connect to the backend server.';

    if (window.confirm(confirmMessage)) {
      setDataMode(mode);
    }
  };

  return (
    <div className="data-mode-toggle">
      <button
        className="data-mode-toggle__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle data mode settings"
        title="Data storage mode"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 12a2 2 0 100-4 2 2 0 000 4z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.32 12.9a1.4 1.4 0 00.28 1.54l.05.05a1.7 1.7 0 11-2.4 2.4l-.05-.05a1.4 1.4 0 00-1.54-.28 1.4 1.4 0 00-.85 1.28V18a1.7 1.7 0 01-3.4 0v-.07a1.4 1.4 0 00-.92-1.28 1.4 1.4 0 00-1.54.28l-.05.05a1.7 1.7 0 11-2.4-2.4l.05-.05a1.4 1.4 0 00.28-1.54 1.4 1.4 0 00-1.28-.85H2a1.7 1.7 0 110-3.4h.07a1.4 1.4 0 001.28-.92 1.4 1.4 0 00-.28-1.54l-.05-.05a1.7 1.7 0 112.4-2.4l.05.05a1.4 1.4 0 001.54.28h.07a1.4 1.4 0 00.85-1.28V2a1.7 1.7 0 013.4 0v.07a1.4 1.4 0 00.85 1.28 1.4 1.4 0 001.54-.28l.05-.05a1.7 1.7 0 112.4 2.4l-.05.05a1.4 1.4 0 00-.28 1.54v.07a1.4 1.4 0 001.28.85H18a1.7 1.7 0 010 3.4h-.07a1.4 1.4 0 00-1.28.92z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="data-mode-toggle__label">
          {currentMode === 'localStorage' ? 'Local' : 'API'}
        </span>
      </button>

      {isOpen && (
        <div className="data-mode-toggle__dropdown">
          <div className="data-mode-toggle__header">
            <h3 className="data-mode-toggle__title">Data Storage Mode</h3>
            <button
              className="data-mode-toggle__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="data-mode-toggle__options">
            <button
              className={`data-mode-toggle__option ${
                currentMode === 'localStorage' ? 'data-mode-toggle__option--active' : ''
              }`}
              onClick={() => handleModeChange('localStorage')}
            >
              <div className="data-mode-toggle__option-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="data-mode-toggle__option-content">
                <div className="data-mode-toggle__option-title">
                  LocalStorage
                  {currentMode === 'localStorage' && (
                    <span className="data-mode-toggle__badge">Active</span>
                  )}
                </div>
                <div className="data-mode-toggle__option-desc">
                  Store data in browser (offline, development)
                </div>
              </div>
            </button>

            <button
              className={`data-mode-toggle__option ${
                currentMode === 'api' ? 'data-mode-toggle__option--active' : ''
              }`}
              onClick={() => handleModeChange('api')}
            >
              <div className="data-mode-toggle__option-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="data-mode-toggle__option-content">
                <div className="data-mode-toggle__option-title">
                  API Server
                  {currentMode === 'api' && (
                    <span className="data-mode-toggle__badge">Active</span>
                  )}
                </div>
                <div className="data-mode-toggle__option-desc">
                  Connect to backend (production-like)
                </div>
              </div>
            </button>
          </div>

          <div className="data-mode-toggle__info">
            <p>
              Switching modes will reload the application. Your data in the
              inactive mode will be preserved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataModeToggle;

