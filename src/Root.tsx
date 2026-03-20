import { Composition } from 'remotion';
import { ReelComposition } from './ReelComposition';
import { CohbyAdComposition } from './CohbyAdComposition';
import { UKChallengesComposition } from './UKChallengesComposition';
import { CanadaProspectsComposition } from './CanadaProspectsComposition';
import { DynamicReelComposition } from './DynamicReelComposition';
import week1 from './data/week1.json';
import './styles.css';

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
        component={DynamicReelComposition}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={week1[0] as any}
      />
    </>
  );
};
