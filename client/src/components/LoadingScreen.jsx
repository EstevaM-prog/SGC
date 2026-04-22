import React from 'react';
import '../styles/components/LoadingScreen.css';

export default function LoadingScreen({ message = 'Carregando sua experiência...' }) {
  return (
    <div className="loading-overlay">
      {/* Dynamic Background Blobs */}
      <div className="loading-blob loading-blob-1"></div>
      <div className="loading-blob loading-blob-2"></div>
      <div className="loading-blob loading-blob-3"></div>

      <div className="loading-content">
        <div className="loading-logo-wrapper">
          <div className="loading-ring-outer"></div>
          <div className="loading-ring-inner"></div>
          <div className="loading-logo">
            <span className="logo-s">S</span>
            <span className="logo-divider">|</span>
            <span className="logo-gc">GC</span>
          </div>
        </div>
        
        <div className="loading-message-wrapper">
          <p className="loading-text">{message}</p>
          <div className="dots-container">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
        
        <div className="loading-bar-container">
          <div className="loading-bar-progress"></div>
          <div className="loading-bar-glow"></div>
        </div>
      </div>
    </div>
  );
}
