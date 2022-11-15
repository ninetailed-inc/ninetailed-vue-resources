import { createContext } from 'react';
import { ExperienceConfiguration } from '@ninetailed/experience.js';

type ExperimentsContextValue = {
  experiments: ExperienceConfiguration[];
};

export const ExperimentsContext = createContext<ExperimentsContextValue | undefined>(undefined);
