import { useCallback } from 'react';
import { Profile, selectActiveExperiments, ExperienceConfiguration } from '@ninetailed/experience.js';

import { EXPERIENCE_TRAIT_PREFIX } from './constants';
import { useNinetailed } from '../useNinetailed';

type UseJoinExperimentArgs = {
  experiences: ExperienceConfiguration[];
};

type JoinExperimentArgs = {
  experiment: ExperienceConfiguration;
  profile: Profile;
};

export const useJoinExperiment = ({ experiences }: UseJoinExperimentArgs) => {
  const { identify } = useNinetailed();

  // TODO this gets called twice

  return useCallback(
    ({ experiment, profile }: JoinExperimentArgs) => {
      const activeExperiments = selectActiveExperiments(experiences, profile);

      if (!activeExperiments.length && experiment.type === 'nt_experiment') {
        identify(profile.id, { [`${EXPERIENCE_TRAIT_PREFIX}${experiment.id}`]: true });
      }
    },
    [experiences]
  );
};
