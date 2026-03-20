import React from 'react';
import { AbsoluteFill, Sequence, OffthreadVideo, Img, interpolate, useCurrentFrame, useVideoConfig, Audio } from 'remotion';
import { GlobalCTA } from './components/GlobalCTA';
import './dynamic-styles.css';

export type TemplateType = 'A' | 'B' | 'C';

export interface DynamicVideoProps {
  id: string;
  templateType: TemplateType;
  title: string;
  subtitle: string;
  imageUrl: string;
  audioUrl: string;
  durationInSeconds?: number;
  contentFrames?: number;
  totalFrames?: number;
}

const CTA_FRAMES = 180; // 6 seconds at 30fps

export const DynamicReelComposition: React.FC<DynamicVideoProps> = ({
  templateType,
  title,
  subtitle,
  imageUrl,
  audioUrl,
  contentFrames,
  totalFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Dynamic content end frame — fall back gracefully if not passed
  const contentEnd = contentFrames ?? (durationInFrames - CTA_FRAMES);

  // Audio fades out 1 second before the CTA starts
  const audioFadeStart = contentEnd - fps;
  const bgVolume = interpolate(
    frame,
    [0, audioFadeStart, contentEnd],
    [0.7, 0.7, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const renderTemplate = () => {
    switch (templateType) {
      case 'A':
        return (
          <AbsoluteFill className="dyn-template-a">
            <Img
              src={imageUrl}
              className="dyn-img"
              style={{
                transform: `scale(${interpolate(frame, [0, contentEnd], [1, 1.12])})`
              }}
            />
            <div
              className="dyn-box-a"
              style={{
                transform: `translateY(${interpolate(frame, [20, 50], [120, 0], { extrapolateRight: 'clamp' })})`,
                opacity: interpolate(frame, [20, 45], [0, 1], { extrapolateRight: 'clamp' })
              }}
            >
              <h1 className="dyn-title-a">{title}</h1>
              <h2
                className="dyn-subtitle-a"
                style={{ opacity: interpolate(frame, [80, 110], [0, 1], { extrapolateRight: 'clamp' }) }}
              >
                {subtitle}
              </h2>
            </div>
          </AbsoluteFill>
        );

      case 'B': {
        // Pure code-driven typewriter — no CSS width tricks
        const totalChars = title.length;
        const typeEnd = Math.min(120, contentEnd * 0.25);
        const charsToShow = Math.floor(
          interpolate(frame, [20, typeEnd], [0, totalChars], { extrapolateRight: 'clamp' })
        );
        const textToShow = title.substring(0, charsToShow);
        // Blinking cursor — toggles every 15 frames, stops after typing is done
        const typingDone = charsToShow >= totalChars;
        const cursorOpacity = typingDone ? 0 : Math.floor(frame / 15) % 2 === 0 ? 1 : 0;

        return (
          <AbsoluteFill className="dyn-template-b" style={{ backgroundColor: '#020c1b' }}>
            <div className="dyn-split-top">
              <Img
                src={imageUrl}
                className="dyn-img"
                style={{
                  transform: `scale(1.08) translateX(${interpolate(frame, [0, contentEnd], [0, -30])}px)`
                }}
              />
            </div>
            <div className="dyn-split-bottom">
              <h1 className="dyn-title-b">
                {textToShow}
                <span style={{ opacity: cursorOpacity, color: '#FFA500', marginLeft: 2 }}>|</span>
              </h1>
              <h2
                className="dyn-subtitle-b"
                style={{
                  opacity: interpolate(frame, [typeEnd + 10, typeEnd + 40], [0, 1], { extrapolateRight: 'clamp' })
                }}
              >
                {subtitle}
              </h2>
            </div>
          </AbsoluteFill>
        );
      }

      case 'C':
        return (
          <AbsoluteFill className="dyn-template-c">
            <Img
              src={imageUrl}
              className="dyn-img"
              style={{
                filter: `blur(${interpolate(frame, [0, contentEnd], [4, 12])}px)`,
                transform: `scale(1.08)`
              }}
            />
            <div className="dyn-overlay-c">
              <h1
                className="dyn-title-c"
                style={{
                  opacity: interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' }),
                  transform: `scale(${interpolate(frame, [0, contentEnd], [0.95, 1.05])})`
                }}
              >
                &ldquo;{title}&rdquo;
              </h1>
              <p
                className="dyn-subtitle-c"
                style={{
                  opacity: interpolate(frame, [140, 170], [0, 1], { extrapolateRight: 'clamp' }),
                  transform: `translateY(${interpolate(frame, [140, 185], [30, 0], { extrapolateRight: 'clamp' })}px)`
                }}
              >
                {subtitle}
              </p>
            </div>
          </AbsoluteFill>
        );

      default:
        return null;
    }
  };

  return (
    <AbsoluteFill className="dyn-root">
      <Audio src={audioUrl} volume={bgVolume} />

      {/* Dynamic content section */}
      <Sequence from={0} durationInFrames={contentEnd}>
        {renderTemplate()}
      </Sequence>

      {/* Universal CTA screen */}
      <Sequence from={contentEnd} durationInFrames={CTA_FRAMES}>
        <GlobalCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
