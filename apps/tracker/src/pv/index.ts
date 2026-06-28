import { report } from "@/report";
import type { PvDto, TrackerConfig } from "@en/common/tracker";

const reportView = (visitorId: string, config: TrackerConfig) => {
  let url = config.baseUrl + config.pv.api;
  const isHash = window.location.href.includes("#");
  const body: PvDto = {
    visitorId,
    url: window.location.protocol + "//" + window.location.host,
    referrer: document.referrer,
    path: isHash ? "/" + window.location.hash : window.location.pathname,
  };
  report(url, body);
};

export const reportPv = (visitorId: string, config: TrackerConfig) => {
  reportView(visitorId, config);
  // 路由的模式 hash
  window.addEventListener("hashchange", () => {
    console.log("hashchange");
  });

  // 路由的模式 history
  // router.push router.replace
  window.addEventListener("popstate", () => {
    console.log("popstate");
  });
  // 临时变量重写原型链上方法
  const originalPushState = history.pushState;
  history.pushState = function (data, unused, url) {
    originalPushState.apply(this, [data, unused, url]);
    reportView(visitorId, config);
    console.log("pushState");
  };
  const originalReplaceState = history.replaceState;
  history.replaceState = function (data, unused, url) {
    originalReplaceState.apply(this, [data, unused, url]);
    reportView(visitorId, config);
    console.log("replaceState");
  };
};
