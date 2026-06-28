import type { UvDto, TrackerConfig } from "@en/common/tracker";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { UAParser } from "ua-parser-js";
import { reportFetch } from "@/report";

export const getBrowerInfo = () => {
  const ua = new UAParser();
  return {
    brower: ua.getBrowser().name ?? "unknown",
    os: ua.getOS().name ?? "unknown",
    device: ua.getDevice().type || "desktop",
  };
};

export const getFingerprint = async (config: TrackerConfig) => {
  const browserInfo = getBrowerInfo();
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  const body: UvDto = {
    anonymousId: result.visitorId,
    browser: browserInfo.brower,
    os: browserInfo.os,
    device: browserInfo.device,
  };
  // 上报给后端
  let url = config.baseUrl + config.uv.api;
  const res = await reportFetch(url, body);
  return res.data;
};
