import { useContext } from 'react';

import { ExperimentsContext } from './ExperimentsContext';

 export const useExperiments = () => {
  const context = useContext(ExperimentsContext);

  if (context === undefined) {
    throw new Error(
      'The component using the the context must be a descendant of the ExperimentsProvider'
    );
  }

  return { experiments: context.experiments };
};
