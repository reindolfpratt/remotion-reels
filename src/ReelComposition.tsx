import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import React from 'react';

export const ReelComposition: React.FC = () => {
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

  // Value Prop Animations (Frame 180-600)
  const valuePropOpacity = interpolate(frame, [180, 210], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const valuePropTranslateY = spring({
    frame: frame - 180,
    fps,
    config: { damping: 12 },
  });
  const valuePropExit = interpolate(frame, [570, 600], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // CTA Animations (Frame 600-900)
  const ctaOpacity = interpolate(frame, [600, 630], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const ctaScale = spring({
    frame: frame - 600,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  return (
    <AbsoluteFill className="bg-container">
      {/* Background gradients moving */}
      <div 
        className="gradient-orb orb-1" 
        style={{
          transform: `translate(${Math.sin(frame / 60) * 100}px, ${Math.cos(frame / 60) * 100}px)`
        }} 
      />
      <div 
        className="gradient-orb orb-2"
        style={{
          transform: `translate(${Math.cos(frame / 50) * 150}px, ${Math.sin(frame / 50) * 150}px)`
        }}
      />
      
      <div className="content-wrapper glass">
        {/* Sequence 1: Hook */}
        <Sequence from={0} durationInFrames={180}>
          <div 
            className="title-section"
            style={{ 
              opacity: titleOpacity * titleExit, 
              transform: `translateY(${100 - titleTranslateY * 100}px)` 
            }}
          >
            <h1 className="title neon-text">
              Transform Your Workflow
            </h1>
            <p className="subtitle">Discover the Secret to 10x Productivity</p>
          </div>
        </Sequence>

        {/* Sequence 2: Value Proposition */}
        <Sequence from={180} durationInFrames={420}>
          <div 
            className="value-prop-section"
            style={{
              opacity: valuePropOpacity * valuePropExit,
              transform: `translateY(${50 - valuePropTranslateY * 50}px)`
            }}
          >
            <div className="feature-card">
              <h2>Automate Everything</h2>
              <p>Say goodbye to manual tasks and let AI do the heavy lifting.</p>
            </div>
            <div className="feature-card" style={{ marginTop: '40px' }}>
              <h2>Seamless Integration</h2>
              <p>Works right where you are, with the tools you already love.</p>
            </div>
          </div>
        </Sequence>

        {/* Sequence 3: Call To Action */}
        <Sequence from={600} durationInFrames={300}>
          <div 
            className="cta-section"
            style={{
              opacity: ctaOpacity,
              transform: `scale(${ctaScale * 0.5 + 0.5})`
            }}
          >
            <h2 className="cta-heading neon-text">Ready to Level Up?</h2>
            <div className="cta-button">
              Get Started Now
            </div>
          </div>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
