import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence, Audio, staticFile, Img } from 'remotion';
import React from 'react';
import './uk-challenges-styles.css';

export const UKChallengesComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background Audio Volume Envelope
  // Ducking the music while voiceover is playing, then fading out at the very end
  const bgVolume = interpolate(
    frame,
    [0, 960, 1080],
    [0.8, 0.8, 0], 
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill className="uk-bg">
      {/* Audio Mix */}
      <Audio src={staticFile('background.mp3')} volume={bgVolume} />

      {/* Sequence 1: The Dream (0-240) */}
      <Sequence from={0} durationInFrames={240}>
        <AbsoluteFill>
          <Img 
            src={staticFile('images/university_uk.png')} 
            className="uk-image"
            style={{
              transform: `scale(${interpolate(frame, [0, 240], [1, 1.1])})`
            }}
          />
          <div className="uk-caption-box" style={{ opacity: interpolate(frame, [10, 40, 200, 240], [0, 1, 1, 0]) }}>
            "Studying in the UK is a dream..."
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 2: Weather Challenge (240-420) */}
      <Sequence from={240} durationInFrames={180}>
        <AbsoluteFill>
          <Img 
            src={staticFile('images/city_weather_uk.png')} 
            className="uk-image"
            style={{
              transform: `scale(1.1) translateX(${interpolate(frame, [240, 420], [0, -40])}px)`
            }}
          />
          <div className="uk-caption-box" style={{ opacity: interpolate(frame, [250, 280, 380, 420], [0, 1, 1, 0]) }}>
            "First, adjusting to the British weather."
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 3: Academics & Cost (420-720) */}
      <Sequence from={420} durationInFrames={300}>
        <AbsoluteFill>
          <Img 
            src={staticFile('images/students_uk.png')} 
            className="uk-image"
            style={{
              transform: `scale(${interpolate(frame, [420, 720], [1.1, 1])}) translateY(${interpolate(frame, [420, 720], [-20, 0])}px)`
            }}
          />
          <div className="uk-caption-box" style={{ opacity: interpolate(frame, [430, 460, 560, 580], [0, 1, 1, 0]) }}>
            "Second, managing the high cost of living."
          </div>
          <div className="uk-caption-box" style={{ opacity: interpolate(frame, [590, 620, 700, 720], [0, 1, 1, 0]) }}>
            "Third, understanding the intense grading system."
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Sequence 4: The Solution CTA (720-1080) */}
      <Sequence from={720} durationInFrames={360}>
        <AbsoluteFill className="uk-cta-bg" style={{ opacity: interpolate(frame, [720, 760], [0, 1], { extrapolateRight: 'clamp' }) }}>
          <div className="uk-cta-wrapper" style={{ transform: `scale(${spring({ frame: frame - 720, fps, config: { damping: 10 } })})` }}>
            <h2 className="uk-brand">COHBY CONSULT</h2>
            <p className="uk-cta-text">But don't worry, we're here to guide you every step of the way!</p>
            <div className="uk-cta-button" style={{ transform: `scale(${interpolate(frame, [900, 930], [1, 1.1])})` }}>
              www.cohbyconsult.com
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      
      {/* Global Vignette for contrast */}
      <div className="uk-vignette" />
    </AbsoluteFill>
  );
};
