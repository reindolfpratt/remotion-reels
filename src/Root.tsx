import { Composition } from 'remotion';
import { ReelComposition } from './ReelComposition';
import { CohbyAdComposition } from './CohbyAdComposition';
import { UKChallengesComposition } from './UKChallengesComposition';
import { CanadaProspectsComposition } from './CanadaProspectsComposition';
import { DynamicReelComposition, DynamicVideoProps } from './DynamicReelComposition';
import week1 from './data/week1.json';
import './styles.css';

const FPS = 30;
const CTA_FRAMES = 120;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="InstagramReel"
        component={ReelComposition}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="CohbyAd"
        component={CohbyAdComposition}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="UKChallenges"
        component={UKChallengesComposition}
        durationInFrames={1080}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="CanadaProspects"
        component={CanadaProspectsComposition}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="DynamicReel"
        component={DynamicReelComposition as any}
        // Default duration - overridden dynamically by calculateMetadata
        durationInFrames={900}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={week1[0] as unknown as DynamicVideoProps}
        calculateMetadata={({ props }) => {
          const seconds = (props as DynamicVideoProps).durationInSeconds ?? 30;
          const contentFrames = Math.round(seconds * FPS);
          const totalFrames = contentFrames + CTA_FRAMES;
          return {
            durationInFrames: totalFrames,
            props: {
              ...props,
              contentFrames,
              totalFrames,
            } as unknown as Record<string, unknown>,
          };
        }}
      />
    </>
  );
};
