import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import '../global-cta-styles.css';

export const GlobalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animations for the Global CTA
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill className="gcta-bg" style={{ opacity }}>
      <div className="gcta-container" style={{ transform: `scale(${scale})` }}>
        
        {/* Placeholder for the user's actual logo.png */}
        {/* Since the client uploads 'logo.png' we render it if it exists, otherwise fall back to styled text */}
        <div className="gcta-logo-wrapper">
          <img src="/public/images/logo.png" className="gcta-logo-img" alt="Cohby Consult Logo" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              document.getElementById('fallback-logo')!.style.display = 'block';
            }} 
          />
          <h1 id="fallback-logo" className="gcta-brand-fallback" style={{ display: 'none' }}>
            COHBY <span className="gcta-brand-sub">CONSULT</span>
          </h1>
        </div>

        <h2 className="gcta-tagline">Your Pathway to Global Education Excellence</h2>

        <div className="gcta-grid">
          <div className="gcta-card">
            <div className="gcta-card-icon">🌐</div>
            <div className="gcta-card-content">
              <span className="gcta-card-label">Website</span>
              <span className="gcta-card-value">www.cohbyconsult.com</span>
            </div>
          </div>
          
          <div className="gcta-card">
            <div className="gcta-card-icon">🇬🇧</div>
            <div className="gcta-card-content">
              <span className="gcta-card-label">WhatsApp UK</span>
              <span className="gcta-card-value">+44 7424742415</span>
            </div>
          </div>

          <div className="gcta-card">
            <div className="gcta-card-icon">🇨🇦</div>
            <div className="gcta-card-content">
              <span className="gcta-card-label">Mobile Canada</span>
              <span className="gcta-card-value">+1 343 8832087</span>
            </div>
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
