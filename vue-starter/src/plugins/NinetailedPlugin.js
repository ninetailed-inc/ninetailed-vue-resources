import { Ninetailed } from "@ninetailed/experience.js";

export default {
  install(Vue) {
    const ninetailed = new Ninetailed({ clientId: "YOUR_CLIENT_ID" });
    Vue.prototype.$ninetailed = ninetailed;
  },
};
