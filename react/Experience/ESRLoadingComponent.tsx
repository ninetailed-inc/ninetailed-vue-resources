import React from 'react';
import has from 'lodash/has';

import { ExperienceLoadingComponent } from './Experience';

type ESRContextValue = {
  experienceVariantsMap: Record<string, number>;
};

export const ESRContext = React.createContext<
ESRContextValue | undefined
>(undefined);

type ESRProviderProps = {
  experienceVariantsMap: Record<string, number>;
};

export const ESRProvider: React.FC<
ESRProviderProps
> = ({ experienceVariantsMap, children }) => {
  return (
    <ESRContext.Provider value={{ experienceVariantsMap }}>
      {children}
    </ESRContext.Provider>
  );
};

export const useESR = () => {
  const context = React.useContext(ESRContext);

  if (context === undefined) {
    throw new Error(
      'The component using the the context must be a descendant of the ESRProvider'
    );
  }

  return { experienceVariantsMap: context.experienceVariantsMap };
};

export const ESRLoadingComponent: ExperienceLoadingComponent = ({ experiences, component: Component, ...baseline }) => {
    const { experienceVariantsMap } = useESR();

    const experience = experiences.find((experience) =>
      has(experienceVariantsMap, experience.id)
    );

    if (!experience) {
      return <Component {...baseline} />;
    }

    const component = experience.components.find(
      (component) => component.baseline.id === baseline.id
    );

    if (!component) {
      return <Component {...baseline} />;
    }

    if (experienceVariantsMap[experience.id] === 0) {
      return <Component {...baseline} />;
    }

    const variant =
      component.variants[experienceVariantsMap[experience.id] - 1];

    if (!variant) {
      return <Component {...baseline} />;
    }

    return <Component {...variant} />;
  };
