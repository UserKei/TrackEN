import { fetchEventSource } from "@microsoft/fetch-event-source";
import type { Method } from "axios";

export const sse = <T, V = unknown>(
  url: string,
  method: Method = "POST",
  body: V,
  callback?: (data: T) => void,
  errorCallback?: (err: Error) => void,
) => {
  void fetchEventSource(url, {
    method: method.toUpperCase(),
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    onmessage: (event) => {
      callback?.(JSON.parse(event.data) as T);
    },
    onerror: (err) => {
      errorCallback?.(err as Error);
    },
  });
};
