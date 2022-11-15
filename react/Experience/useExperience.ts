import {
  Baseline,
  Variant,
  ExperienceConfiguration,
  selectHasExperienceVariants,
  selectActiveExperiments,
  selectExperience,
  selectExperienceVariant,
  Profile,
} from '@ninetailed/experience.js';

import { useProfile } from '../useProfile';
import { useExperiments } from './useExperiments';

type Load = {
  status: 'loading';
  loading: boolean;
  hasVariants: boolean;
  baseline: Baseline;
  experience: null;
  variant: null;
  audience: null;
  isPersonalized: boolean;
  profile: null;
  error: null;
};

type Success = {
  status: 'success';
  loading: boolean;
  hasVariants: boolean;
  baseline: Baseline;
  experience: ExperienceConfiguration | null;
  variant: Variant | null;
  audience: { id: string } | null;
  isPersonalized: boolean;
  profile: Profile;
  error: null;
};

type Fail = {
  status: 'error';
  loading: boolean;
  hasVariants: boolean;
  baseline: Baseline;
  experience: null;
  variant: null;
  audience: null;
  isPersonalized: boolean;
  profile: null;
  error: Error;
};

type UseExperienceArgs = {
  baseline: Baseline;
  experiences: ExperienceConfiguration[];
};

type UseExperienceResponse = Load | Success | Fail;

export const useExperience = ({
  baseline,
  experiences,
}: UseExperienceArgs): UseExperienceResponse => {
  const profileState = useProfile();
  const { experiments } = useExperiments();

  const hasVariants = experiences
    .map((experience) => selectHasExperienceVariants(experience, baseline))
    .reduce((acc, curr) => acc || curr, false);

  const { status, profile } = profileState;
  const baseReturn = {
    ...profileState,
    hasVariants,
    baseline,
  };
  const emptyReturn = {
    ...baseReturn,
    experience: null,
    variant: null,
    audience: null,
    isPersonalized: false,
    profile: null,
  };

  if (status === 'loading') {
    // @ts-ignore
    return emptyReturn;
  }

  if (status === 'error') {
    // @ts-ignore
    return emptyReturn;
  }

  if (!profile) {
     // @ts-ignore
     return emptyReturn;
  }

  const activeExperiments = selectActiveExperiments(experiments, profile);

  const experience = selectExperience({
    experiences,
    activeExperiments,
    profile,
  });

  if (!experience) {
    // @ts-ignore
    return emptyReturn;
  }

  const audience = experience.audience;
  const variant = selectExperienceVariant({ baseline, experience, profile });

  if (!variant) {
    return {
      ...baseReturn,
      status: 'success',
      loading: false,
      error: null,
      experience,
      variant: null,
      audience: audience ? audience : null,
      profile,
      isPersonalized: false,
    };
  }

  return {
    ...baseReturn,
    status: 'success',
    loading: false,
    error: null,
    experience,
    variant,
    audience: audience ? audience : null,
    profile,
    isPersonalized: true,
  };
};
