import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { isBrowser, Profile } from '@ninetailed/experience.js-shared';
import {
  ExperienceConfiguration,
  selectDistribution,
} from '@ninetailed/experience.js';

import { useNinetailed } from '../useNinetailed';

type TrackExperienceProps = {
  experience: ExperienceConfiguration;
  variant: { id: string };
  profile: Profile;
};

export const TrackExperience: React.FC<
  React.PropsWithChildren<TrackExperienceProps>
> = ({ children, experience, variant, profile }) => {
  const ninetailed = useNinetailed();
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (isBrowser() && inView) {
      const distribution = selectDistribution({ experience, profile });

      ninetailed.trackExperience({
        experience,
        component: variant,
        variant: distribution.index,
      });
    }
  }, [inView]);
  return (
    <>
      <div ref={ref} id="nt-experience-handle" />
      {children}
    </>
  );
};
