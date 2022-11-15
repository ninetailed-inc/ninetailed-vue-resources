import React from 'react';
import { ExperienceConfiguration } from '@ninetailed/experience.js';

import { ExperimentsContext } from './ExperimentsContext';

type ExperimentsProviderProps = {
  experiments: ExperienceConfiguration[];
};

export const ExperimentsProvider: React.FC<ExperimentsProviderProps> = ({
  experiments,
  children,
}) => {
  return (
    <ExperimentsContext.Provider value={{ experiments }}>
      {children}
    </ExperimentsContext.Provider>
  );
};
