import React, { useMemo } from 'react';
import { AnalyticsPlugin } from 'analytics';
import { Ninetailed, OnErrorHandler, OnLogHandler, ExperienceConfiguration } from '@ninetailed/experience.js';
import { Profile, Locale } from '@ninetailed/experience.js-shared';

import { NinetailedContext } from './NinetailedContext';
import { ExperimentsProvider } from './Experience/ExperimentsProvider';

export type NinetailedProviderProps = {
  clientId: string;
  environment?: string;
  experiments?: ExperienceConfiguration[];
  preview?: boolean;
  url?: string;
  plugins?: (AnalyticsPlugin | AnalyticsPlugin[])[];
  profile?: Profile;
  locale?: Locale;
  requestTimeout?: number;
  onLog?: OnLogHandler;
  onError?: OnErrorHandler;
};

export const NinetailedProvider: React.FC<
  React.PropsWithChildren<NinetailedProviderProps>
> = ({
  children,
  clientId,
  experiments = [],
  environment,
  preview,
  url,
  profile,
  locale,
  requestTimeout,
  plugins = [],
  onLog,
  onError,
}) => {
  const ninetailed = useMemo(
    () =>
      new Ninetailed(
        { clientId, environment, preview },
        { url, plugins, profile, locale, requestTimeout, onLog, onError }
      ),
    []
  );

  return (
    <NinetailedContext.Provider value={ninetailed}>
      <ExperimentsProvider experiments={experiments}>{children}</ExperimentsProvider>
    </NinetailedContext.Provider>
  );
};
