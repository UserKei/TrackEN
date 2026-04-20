import { install } from "element-plus";
import type { App, Plugin } from "vue";

export default {
  install(app: App) {
    app.directive("focus", {
      mounted(el: HTMLElement) {
        el.focus();
      },
    });
  },
};
