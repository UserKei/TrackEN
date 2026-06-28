import type { ErrorDto, TrackerConfig } from "@en/common/tracker";
import { report } from "@/report";

export const reportError = (visitorId: string, config: TrackerConfig) => {
  // 捕获全局 js 错误
  let url = config.baseUrl + config.error.api;
  window.addEventListener("error", (e: ErrorEvent) => {
    console.log(e);
    const body: ErrorDto = {
      visitorId,
      error: "js", // js 错误
      message: e.message, // 错误信息
      stack: e.error instanceof Error ? (e.error.stack ?? e.message) : e.message, // 错误堆栈
      url: e.filename, // 错误文件
    };
    // console.log("report error", body);
    report(url, body);
  });
  // 捕获全局 Promise 错误
  window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
    const isError = e.reason instanceof Error;
    const body: ErrorDto = {
      visitorId,
      error: "promise", // Promise 错误
      message: isError ? e.reason.message : JSON.stringify(e.reason), // 错误信息
      stack: isError ? (e.reason.stack ?? e.reason.message) : "Promise rejection", // 错误堆栈
      url: window.location.href, // 错误文件
    };
    report(url, body);
    // console.log(body);
    // console.log(e);
  });
};
