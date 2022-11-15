import React, { useState, useEffect } from 'react';
import {
  Baseline,
  ExperienceConfiguration,
  Profile,
} from '@ninetailed/experience.js';

import { TrackExperience } from './TrackExperience';
import { useExperience } from './useExperience';
import { useJoinExperiment } from './useJoinExperiment';
import { Variant } from './types';
import { useNinetailed } from '../useNinetailed';

export type ExperienceComponent<P> = React.ComponentType<
  Omit<P, 'id'> & {
    ninetailed?: {
      isPersonalized: boolean;
      audience: { id: string };
    };
  }
>;

export type ExperienceBaseProps<
  P,
  PassThroughProps extends Partial<P>
> = Baseline<Pick<P, Exclude<keyof P, keyof PassThroughProps>>> & {
  experiences: ExperienceConfiguration[];
  component: ExperienceComponent<P> | React.ComponentType<P>;
  passthroughProps?: PassThroughProps;
};

export type ExperienceLoadingComponent<
  P,
  PassThroughProps extends Partial<P>
> = React.ComponentType<ExperienceBaseProps<P, PassThroughProps>>;

export type ExperienceProps<
  P,
  PassThroughProps extends Partial<P>
> = ExperienceBaseProps<P, PassThroughProps> & {
  experiences: ExperienceConfiguration[];
  component: ExperienceComponent<P> | React.ComponentType<P>;
  loadingComponent?: ExperienceLoadingComponent<P, PassThroughProps>;
};

type DefaultExperienceLoadingComponentProps = ExperienceBaseProps<{}, {}> & {
  unhideAfterMs?: number;
};

export const DefaultExperienceLoadingComponent: React.FC<
  DefaultExperienceLoadingComponentProps
> = ({
  component: Component,
  experiences,
  unhideAfterMs = 5000,
  passthroughProps,
  ...baseline
}) => {
  const { logger } = useNinetailed();

  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(false);
      logger.error(
        new Error(
          `The experience was still in loading state after ${unhideAfterMs}ms. That happens when no events are sent to the Ninetailed API. The baseline is now shown instead.`
        )
      );
    }, unhideAfterMs);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (hidden) {
    return (
      <div key="hide" style={{ opacity: 0 }}>
        <Component
          {...passthroughProps}
          {...baseline}
          ninetailed={{ isPersonalized: false, audience: { id: 'baseline' } }}
        />
      </div>
    );
  }

  return (
    <Component
      {...passthroughProps}
      {...baseline}
      ninetailed={{ isPersonalized: false, audience: { id: 'baseline' } }}
    />
  );
};

export const Experience = <P extends Object, PassThroughProps extends Partial<P> = Partial<P>>({
  experiences,
  component: Component,
  loadingComponent:
    LoadingComponent = DefaultExperienceLoadingComponent as unknown as ExperienceLoadingComponent<
      P,
      PassThroughProps
    >,
  passthroughProps,
  ...baseline
}: ExperienceProps<P, PassThroughProps>) => {
  const {
    status,
    hasVariants,
    experience,
    variant,
    audience,
    isPersonalized,
    profile,
  } = useExperience({
    baseline,
    experiences,
  });
  const joinExperiment = useJoinExperiment({
    experiences,
  });

  useEffect(() => {
    if (status === 'success' && experience && profile) {
      joinExperiment({ experiment: experience, profile });
    }
  }, [status, experience, profile]);

  if (!hasVariants) {
    return (
      <Component
        {...passthroughProps}
        {...(baseline as unknown as Baseline<P>)}
      />
    );
  }

  if (status === 'loading') {
    return (
      <LoadingComponent
        {...(baseline as unknown as Baseline<P>)}
        passthroughProps={passthroughProps}
        experiences={experiences}
        component={Component}
      />
    );
  }

  if (!experience) {
    return (
      <Component
        {...passthroughProps}
        {...(baseline as unknown as Baseline<P>)}
        key={baseline.id}
        ninetailed={{
          isPersonalized: false,
          audience: { id: 'baseline' },
        }}
      />
    );
  }

  if (!variant) {
    return (
      <TrackExperience
        experience={experience}
        variant={baseline}
        // the profile is definitely defined, otherwise there wouldn't be an experience selected
        profile={profile as Profile}
      >
        <Component
          {...passthroughProps}
          {...(baseline as unknown as Baseline<P>)}
          key={baseline.id}
          ninetailed={{
            isPersonalized: false,
            audience: { id: audience?.id || 'all visitors' },
          }}
        />
      </TrackExperience>
    );
  }

  return (
    <TrackExperience
      experience={experience}
      variant={variant}
      // the profile is definitely defined, otherwise there wouldn't be an experience selected
      profile={profile as Profile}
    >
      {variant?.hidden ? null : (
        <Component
          {...passthroughProps}
          {...(variant as Variant<P>)}
          key={`${experience.id}-${variant.id}`}
          ninetailed={{
            isPersonalized,
            audience: { id: audience?.id || 'all visitors' },
          }}
        />
      )}
    </TrackExperience>
  );
};
