import React from 'react';
import { AbsoluteFill, Sequence, Img, interpolate, useCurrentFrame, useVideoConfig, Audio } from 'remotion';
import { GlobalCTA } from './components/GlobalCTA';
import './dynamic-styles.css';

export type SceneData = {
  text: string;
  imageUrl: string;
};

export interface DynamicVideoProps {
  id: string;
  audioUrl: string;
  scenes: SceneData[];
  durationInSeconds?: number;
  contentFrames?: number;
  totalFrames?: number;
}

const CTA_FRAMES = 120; // 4 seconds at 30fps

// Words that should be highlighted for emphasis
const HIGHLIGHT_WORDS = new Set([
  'earlier', 'choices', 'top', 'decision', 'today', 'future',
  'generic', '1-on-1', 'unique', 'naturally', 'YOU',
  'world-class', 'earlier', 'start', 'now', 'every', 'only',
  '70%', '100%', 'free', 'never', 'always', 'must',
]);



export const DynamicReelComposition: React.FC<DynamicVideoProps> = ({
  audioUrl,
  scenes,
  contentFrames,
  totalFrames,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const contentEnd = contentFrames ?? (durationInFrames - CTA_FRAMES);
  const total = totalFrames ?? durationInFrames;

  const bgVolume = interpolate(
    frame,
    [0, contentEnd, total],
    [0.7, 0.7, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const framesPerScene = Math.floor(contentEnd / scenes.length);

  return (
    <AbsoluteFill className="dyn-root" style={{ backgroundColor: '#020c1b' }}>
      <Audio src={audioUrl} volume={bgVolume} />

      {scenes.map((scene, index) => {
        const sceneStart = index * framesPerScene;
        return (
          <Sequence
            key={`scene-${scene.imageUrl}-${index}`}
            from={sceneStart}
            durationInFrames={framesPerScene}
          >
            <SceneContent
              scene={scene}
              duration={framesPerScene}
              index={index}
            />
          </Sequence>
        );
      })}

      {/* Flash transition between each scene */}
      {scenes.map((scene, index) => {
        if (index === 0) return null;
        const flashStart = index * framesPerScene;
        return (
          <Sequence key={`flash-${scene.imageUrl}-${index}`} from={flashStart - 3} durationInFrames={8}>
            <FlashOverlay />
          </Sequence>
        );
      })}

      {/* Universal CTA screen */}
      <Sequence from={contentEnd} durationInFrames={CTA_FRAMES}>
        <GlobalCTA />
      </Sequence>
    </AbsoluteFill>
  );
};

// ─── Flash Overlay ───────────────────────────────────────────────────────────

const FlashOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 2, 6, 8], [0, 1, 0.6, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: 'white',
        opacity,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
};

// ─── Scene Content ───────────────────────────────────────────────────────────

const SceneContent: React.FC<{ scene: SceneData; duration: number; index: number }> = ({ scene, duration, index }) => {
  const frame = useCurrentFrame();

  // Alternate zoom direction: even scenes zoom IN, odd scenes zoom OUT
  const zoomIn = index % 2 === 0;
  const scale = zoomIn
    ? interpolate(frame, [0, duration], [1, 1.18])
    : interpolate(frame, [0, duration], [1.18, 1]);

  // Alternate pan direction for extra energy
  const getPanRange = (i: number): [number, number] => {
    if (i % 3 === 0) return [0, -30];
    if (i % 3 === 1) return [0, 30];
    return [0, 0];
  };
  const [panStart, panEnd] = getPanRange(index);
  const panX = interpolate(frame, [0, duration], [panStart, panEnd]);

  // Slide text from different sides depending on scene index
  const slideFromRight = index % 2 !== 0;
  const textOpacity = interpolate(frame, [5, 22], [0, 1], { extrapolateRight: 'clamp' });
  const textExit = interpolate(frame, [duration - 18, duration - 5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const textX = slideFromRight
    ? interpolate(frame, [5, 22], [80, 0], { extrapolateRight: 'clamp' })
    : interpolate(frame, [5, 22], [-80, 0], { extrapolateRight: 'clamp' });

  // Word-by-word stagger: each word fades in 3 frames after the previous
  const words = scene.text.split(' ');

  return (
    <AbsoluteFill>
      {/* Background image with animated pan/zoom */}
      <Img
        src={scene.imageUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateX(${panX}px)`,
        }}
      />

      {/* Gradient overlay — bottom-heavy for text legibility */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {/* Scene number badge */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          right: 60,
          backgroundColor: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.4)',
          borderRadius: 40,
          padding: '10px 24px',
          fontFamily: 'Inter, sans-serif',
          fontSize: 32,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        {index + 1}
      </div>



      {/* Text block — word-by-word stagger */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '60px',
          paddingBottom: '120px',
          opacity: textOpacity * textExit,
          transform: `translateX(${textX}px)`,
        }}
      >
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '64px',
            color: 'white',
            textAlign: 'left',
            lineHeight: 1.35,
            fontWeight: 800,
            margin: 0,
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            letterSpacing: '-0.5px',
          }}
        >
          {words.map((word, wi) => {
            const wordOpacity = interpolate(
              frame,
              [8 + wi * 3, 14 + wi * 3],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const clean = word.replaceAll(/[^a-zA-Z0-9%]/g, '');
            const isHighlight = HIGHLIGHT_WORDS.has(clean) || HIGHLIGHT_WORDS.has(clean.toUpperCase());
            const isLast = wi === words.length - 1;
            const wordColor = isHighlight ? '#FFD700' : isLast ? '#FF6B6B' : 'white';
            const wordY = interpolate(frame, [8 + wi * 3, 14 + wi * 3], [12, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

            return (
              <React.Fragment key={`word-${wi}`}>
                <span
                  style={{
                    opacity: wordOpacity,
                    display: 'inline-block',
                    color: wordColor,
                    transform: `translateY(${wordY}px)`,
                  }}
                >
                  {word}
                </span>
                {wi < words.length - 1 ? ' ' : ''}
              </React.Fragment>
            );
          })}
        </p>
      </div>
    </AbsoluteFill>
  );
};
