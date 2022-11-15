## Vue Installation Steps

1. Install dependencies and certain helpful utilities:
   - `contentful`, the Contentful JS SDK for getting content
   - `@ninetailed/experience.js` for the Ninetailed instance and experience selection functions
   - `@ninetailed/experience.js-utils-contentful`, which contains some helper methods for parsing Contentful entries
2. Declare a global Ninetailed instance. Here I’m using a plugin to attach `$ninetailed` to the Vue prototype, but I am open to your suggetions. In particular, it seems like the Composition API/Vue 3 advocate against such an approach.

```jsx
// plugins/nintailed/main.js

import { Ninetailed } from "@ninetailed/experience.js";

export default {
  install(Vue, options) {
    const ninetailed = new Ninetailed(
      {
        clientId: options.clientId,
        environment: options.environment || "main",
      },
      {
        plugins: options.plugins || [],
      }
    );
    Vue.prototype.$ninetailed = ninetailed;
  },
};
```

```jsx
// src/main.js
...
import NinetailedPlugin from "./plugins/ninetailed/main.js";
...
Vue.use(NinetailedPlugin, { clientId: "YOUR_CLIENT_ID" });
...
```

3. Load all experiments from the Contentful API and make them globally available, so that you can consume them in experience components:

```jsx
// utils/getExperiments.ts
import { ContentfulClientApi, createClient } from "contentful";
import {
  ExperienceEntry,
  ExperienceMapper,
} from "@ninetailed/experience.js-utils-contentful";

// Functions to switch between Contentful's preview API and prod API
// For the sake of demo, you can use simplify this and use just the "contentfulClient" bit
const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID ?? "",
  accessToken: process.env.CONTENTFUL_TOKEN ?? "",
  environment: process.env.CONTENTFUL_ENVIRONMENT ?? "master",
});

const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID ?? "",
  accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN ?? "",
  host: "preview.contentful.com",
});

const getClient = (preview: boolean): ContentfulClientApi => {
  return preview ? previewClient : contentfulClient;
};

// The important bit: getting experiments
// ExperienceMapper.isExperiment and ExperienceMapper.mapExperiment are helpers for parsing and flattening data
export async function getExperiments() {
  const query = {
    content_type: "nt_experience",
    "fields.nt_type": "nt_experiment",
  };
  const client = getClient(false);
  const entries = (await client.getEntries) < ExperienceEntry > query;

  return (entries.items || [])
    .filter(ExperienceMapper.isExperiment)
    .map(ExperienceMapper.mapExperiment);
}
```

```jsx
// ??.js

import getExperiments from ./utils/getExperiments.js

// Make all of your experiments globally accessible
```

Then, you want to be able to consume your global experiments in an experiment-able component.

4. Fetch all of the experiences attached to a given entry. Ninetailed creates a Contentful field called `nt_experiences` on the content types you specify. We also recommend parsing the referenced experience entries, similar to step 3 when fetching Contentful entries

```jsx
// components/myComponent.vue

...
import {
  ExperienceEntry,
  ExperienceMapper,
} from "@ninetailed/experience.js-utils-contentful"
...
const experiences = YOUR_CONTENT_ENTRY.nt_experiences
  .filter(ExperienceMapper.isExperienceEntry)
  .map(ExperienceMapper.mapExperience)
```

5. The big chunk of logic is to have a wrapping component keep track of:
   1. the current Ninetailed profile
   2. the CMS data defining the baseline, experiences attached to the baseline, and the current variant of the experience being shown
   3. whether the component is personalized or the baseline is being shown
   4. loading and error state

```jsx
// components/myComponent.vue
// You might initialize the data in this component like so:

const profilex = reactive($ninetailed.profile); // What is the correct pattern for making the global profile available to a Vue component in the Composition API?
const loading = ref(true);
const error = ref(null);
const variant = shallowRef(YOUR_CONTENT_ENTRY.fields);
const experience = shallowRef(null);
const baseline = shallowRef(YOUR_CONTENT_ENTRY.fields);
```

Importantly, you want to supply a callback function to the global Ninetailed instance’s `onProfileChange` method. This will call the supplied callback function every time the profile changes. You want to re-calculate which experience and variant applies each time the profile changes.

```jsx
// component/myComponent.vue
...
import { selectActiveExperiments, selectExperience, selectExperienceVariant } from '@ninetailed/experience.js';
...
// The experiments passed in here are the globally loaded ones
$ninetailed.onProfileChange = (profileState) => {
  const { status: profileStateStatus, profile: profileStateProfile } = profileState;
  if (profileStateStatus === 'loading') {
    return
  }
  loading.value = false;

  if (profileStateStatus === 'error') {
    error.value = true;
    return
  }

  if (!profileStateProfile) {
    return
  }

  profile.value = profileStateProfile

  const activeExperiments = selectActiveExperiments($experiments, profile);

  experience.value = selectExperience({
    experiences,
    activeExperiments,
    profile,
  });

  variant.value = selectExperienceVariant({ baseline, experience, profile });
}
```

6. Lastly, your `.vue` template should hide the experience until a variant has been selected by matching the profile. You should also call `ninetailed.trackExperience()` when the component enters the viewport.
