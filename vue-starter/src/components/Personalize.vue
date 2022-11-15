<template>
  <div>
    <VisibilitySensor @change="onChange">
      <component
        :is="selectedComponent"
        :variant="variant"
        :style="style"
      ></component>
    </VisibilitySensor>
  </div>
</template>

<script>
import Vue from "vue";
import { selectVariant } from "@ninetailed/experience.js";
import VisibilitySensor from "vue-visibility-sensor";
Vue.component("VisibilitySensor", VisibilitySensor);
export default {
  props: {
    baseline: Object,
    variants: Array,
    component: {
      type: Object,
      require: true,
    },
    loadingComponent: {
      type: Object,
      value: null,
    },
    holdout: {
      type: Number,
      require: false,
    },
  },
  watch: {
    loading: function () {
      if (this.isVisible && this.wasSeen) {
        this.trackComponent();
      }
    },
  },
  data() {
    return {
      variant: this.baseline,
      style: "opacity: 0;",
      /**
       * Rendered component. Is `component` or `loadingComponent`
       */
      selectedComponent: this.component,
      wasSeen: false,
      isPersonalized: false,
      audience: { id: "baseline" },
      isTracked: false,
      loading: true,
      isVisible: false,
    };
  },
  mounted() {
    if (this.loadingComponent !== null) {
      this.selectedComponent = this.loadingComponent;
      this.style = "";
    }
    this.$ninetailed.onProfileChange((profileState) => {
      let { loading, variant, audience, isPersonalized } = selectVariant(
        this.baseline,
        this.variants,
        profileState,
        { holdout: this.holdout || -1 }
      );
      this.variant = variant;
      if (!loading) {
        // Set default component
        this.selectedComponent = this.component;
        this.audience = audience;
        this.isPersonalized = isPersonalized;
        this.loading = false;
        this.style = "";
      } else {
        if (this.loadingComponent === null) {
          this.selectedComponent = this.component;
          this.style = "opacity: 0;";
        } else {
          this.selectedComponent = this.loadingComponent;
          this.style = "";
        }
      }
      this.onChange;
    });
  },
  methods: {
    /**
     * Gets triggered when component is in visible area of browser
     */
    onChange(isVisible) {
      this.isVisible = isVisible;
      this.wasSeen = true;
      if (!this.loading && !this.isTracked) this.trackComponent();
    },
    trackComponent() {
      this.$ninetailed.trackHasSeenComponent({
        variant: this.variant,
        audience: this.audience,
        isPersonalized: this.isPersonalized,
      });
      this.isTracked = true;
    },
  },
};
</script>
