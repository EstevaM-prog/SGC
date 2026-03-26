import React from 'react';
import { Loader2 } from 'lucide-react';
import '../styles/components/LoadingScreen.css';

export default function LoadingScreen({ message = 'Carregando sua experiência...' }) {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-logo">
          <span className="logo-s">S</span>
          <span className="logo-divider">|</span>
          <span className="logo-gc">GC</span>
        </div>
        
        <div className="loading-spinner-wrap">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
        
        <p className="loading-text">{message}</p>
        
        <div className="loading-bar-container">
          <div className="loading-bar-progress"></div>
        </div>
      </div>
      
      {/* Background blobs for premium feel */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
    </div>
  );
}
