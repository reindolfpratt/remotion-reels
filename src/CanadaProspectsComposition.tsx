import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence, Audio, staticFile, Img } from 'remotion';
import React from 'react';
import { GlobalCTA } from './components/GlobalCTA';
import './canada-styles.css';

export const CanadaProspectsComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background Audio Volume Envelope
  // 15 seconds = 900 frames at 60fps. Fade out starting at frame 840.
  const bgVolume = interpolate(
    frame,
    [0, 840, 900],
    [0.7, 0.7, 0], 
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill className="ca-bg">
      <Audio src={staticFile('canada-bg.mp3')} volume={bgVolume} />

      {/* Sequence 1: Hook (0-225) */}
      <Sequence from={0} durationInFrames={225}>
        <AbsoluteFill>
          <Img 
            src={staticFile('images/canada-city.jpg')} 
            className="ca-image"
            style={{
              transform: `scale(${interpolate(frame, [0, 225], [1, 1.1])})`
            }}
          />
          <div className="ca-caption-box" style={{ opacity: interpolate(frame, [10, 40, 185, 225], [0, 1, 1, 0]) }}>
            <h1 className="ca-title">Why Study in Canada?</h1>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 2: Value Prop 1 - University (225-450) */}
      <Sequence from={225} durationInFrames={225}>
        <AbsoluteFill>
          <Img 
            src={staticFile('images/canada-uni.jpg')} 
            className="ca-image"
            style={{
              transform: `scale(1.1) translateX(${interpolate(frame, [225, 450], [0, -40])}px)`
            }}
          />
          <div className="ca-caption-box" style={{ opacity: interpolate(frame, [235, 265, 410, 450], [0, 1, 1, 0]) }}>
            <h2 className="ca-subtitle">World-Class Education</h2>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 3: Value Prop 2 - Students (450-675) */}
      <Sequence from={450} durationInFrames={225}>
        <AbsoluteFill>
          <Img 
            src={staticFile('images/canada-students.jpg')} 
            className="ca-image"
            style={{
              transform: `scale(${interpolate(frame, [450, 675], [1.1, 1])}) translateY(${interpolate(frame, [450, 675], [-40, 0])}px)`
            }}
          />
          <div className="ca-caption-box" style={{ opacity: interpolate(frame, [460, 490, 635, 675], [0, 1, 1, 0]) }}>
            <h2 className="ca-subtitle">Post-Grad Work Permits & PR</h2>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 4: Universal Global CTA (675-900) */}
      <Sequence from={675} durationInFrames={225}>
        <GlobalCTA />
      </Sequence>
      
      <div className="ca-vignette" />
    </AbsoluteFill>
  );
};
