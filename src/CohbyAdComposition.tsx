import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence, Audio, staticFile } from 'remotion';
import React from 'react';
import './cohby-styles.css';

export const CohbyAdComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro Hook Animations (Frame 0-180)
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const titleTranslateY = spring({
    frame,
    fps,
    config: { damping: 12 },
  });
  const titleExit = interpolate(frame, [150, 180], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Destinations Animations (Frame 180-600)
  const destOpacity = interpolate(frame, [180, 210], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const destTranslateY = spring({
    frame: frame - 180,
    fps,
    config: { damping: 12 },
  });
  const destExit = interpolate(frame, [570, 600], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // CTA Animations (Frame 600-900)
  const ctaOpacity = interpolate(frame, [600, 630], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const ctaScale = spring({
    frame: frame - 600,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  return (
    <AbsoluteFill className="cohby-bg">
      <Audio src={staticFile('background.mp3')} volume={0.8} />

      <div className="cohby-particles" />
      
      <div className="cohby-wrapper">
        {/* Sequence 1: Hook */}
        <Sequence from={0} durationInFrames={180}>
          <div 
            className="cohby-section"
            style={{ 
              opacity: titleOpacity * titleExit, 
              transform: `translateY(${100 - titleTranslateY * 100}px)` 
            }}
          >
            <h2 className="cohby-brand">COHBY CONSULT</h2>
            <h1 className="cohby-title">
              Your Gateway to Global Education
            </h1>
            <p className="cohby-subtitle">Transform Your Academic Dreams into Reality</p>
          </div>
        </Sequence>

        {/* Sequence 2: Destinations */}
        <Sequence from={180} durationInFrames={420}>
          <div 
            className="cohby-section"
            style={{
              opacity: destOpacity * destExit,
              transform: `translateY(${50 - destTranslateY * 50}px)`
            }}
          >
            <h2 className="cohby-dest-title">Study in Top Destinations</h2>
            <div className="cohby-grid">
              {['USA 🇺🇸', 'UK 🇬🇧', 'Canada 🇨🇦', 'Denmark 🇩🇰', 'Finland 🇫🇮', 'Austria 🇦🇹'].map((dest, i) => {
                const cardScale = spring({ frame: frame - 200 - (i * 15), fps, config: { damping: 12 } });
                return (
                  <div key={dest} className="cohby-card" style={{ transform: `scale(${cardScale})` }}>
                    {dest}
                  </div>
                );
              })}
            </div>
          </div>
        </Sequence>

        {/* Sequence 3: CTA */}
        <Sequence from={600} durationInFrames={300}>
          <div 
            className="cohby-section"
            style={{
              opacity: ctaOpacity,
              transform: `scale(${ctaScale * 0.5 + 0.5})`
            }}
          >
            <h2 className="cohby-cta-heading">Start Your Journey Today</h2>
            <div className="cohby-cta-button">
              www.cohbyconsult.com
            </div>
          </div>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
