import type { CourseList } from "@en/common/course";
import { serverApi, type Response } from "@/lib/api";

export const getCourseList = () =>
  serverApi.get("/course/list") as Promise<Response<CourseList>>;

export const getMyCourse = () =>
  serverApi.get("/course/my") as Promise<Response<CourseList>>;
