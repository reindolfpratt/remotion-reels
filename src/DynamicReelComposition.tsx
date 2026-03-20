import React from 'react';
import { AbsoluteFill, Sequence, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
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
}

export const DynamicReelComposition: React.FC<DynamicVideoProps> = ({ 
  templateType, 
  title, 
  subtitle, 
  imageUrl, 
  audioUrl 
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Audio fade-out at frame 840 (1 second before end)
  const bgVolume = interpolate(frame, [0, 840, 900], [0.8, 0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Different dynamic templates ending at frame 675
  const renderTemplate = () => {
    switch (templateType) {
      case 'A':
        return (
          <AbsoluteFill className="dyn-template-a">
            <Img src={imageUrl} className="dyn-img" style={{ transform: `scale(${interpolate(frame, [0, 675], [1, 1.15])})` }} />
            <div className="dyn-box-a" style={{ transform: `translateY(${interpolate(frame, [20, 50], [100, 0], { extrapolateRight: 'clamp' })})`, opacity: interpolate(frame, [20, 40], [0, 1]) }}>
              <h1 className="dyn-title-a">{title}</h1>
              <h2 className="dyn-subtitle-a" style={{ opacity: interpolate(frame, [100, 130], [0, 1], { extrapolateRight: 'clamp' }) }}>{subtitle}</h2>
            </div>
          </AbsoluteFill>
        );
      case 'B':
        return (
           <AbsoluteFill className="dyn-template-b" style={{ backgroundColor: '#020c1b' }}>
             <Sequence from={0} durationInFrames={675}>
               <div className="dyn-split-top">
                 <Img src={imageUrl} className="dyn-img" style={{ transform: `scale(1.1) translateX(${interpolate(frame, [0, 675], [0, -40])}px)` }} />
               </div>
               <div className="dyn-split-bottom">
                 <h1 className="dyn-title-b" style={{ width: `${interpolate(frame, [30, 200], [0, 100], { extrapolateRight: 'clamp' })}%`, overflow: 'hidden', whiteSpace: 'nowrap' }}>{title}</h1>
                 <h2 className="dyn-subtitle-b" style={{ opacity: interpolate(frame, [150, 180], [0, 1], { extrapolateRight: 'clamp' }) }}>{subtitle}</h2>
               </div>
             </Sequence>
           </AbsoluteFill>
        );
      case 'C':
        return (
          <AbsoluteFill className="dyn-template-c">
            <Img src={imageUrl} className="dyn-img" style={{ filter: `blur(${interpolate(frame, [0, 675], [5, 15])}px)`, transform: `scale(1.1)` }} />
            <div className="dyn-overlay-c">
              <h1 className="dyn-title-c" style={{ opacity: interpolate(frame, [0, 60], [0, 1], { extrapolateRight: 'clamp' }), transform: `scale(${interpolate(frame, [0, 600], [0.9, 1.1])})` }}>"{title}"</h1>
              <p className="dyn-subtitle-c" style={{ opacity: interpolate(frame, [200, 230], [0, 1], { extrapolateRight: 'clamp' }), transform: `translateY(${interpolate(frame, [200, 250], [30, 0], { extrapolateRight: 'clamp' })})` }}>{subtitle}</p>
            </div>
          </AbsoluteFill>
        );
    }
  };

  return (
    <AbsoluteFill className="dyn-root">
      <Audio src={audioUrl} volume={bgVolume} />
      
      {/* Dynamic Content Loop */}
      <Sequence from={0} durationInFrames={675}>
        {renderTemplate()}
      </Sequence>

      {/* The Unified Global CTA */}
      <Sequence from={675} durationInFrames={225}>
        <GlobalCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
