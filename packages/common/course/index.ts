//packages/common/course/index.ts
export interface Course {
  id: string;
  name: string;
  value: string; // 课程标识 zk gk ……
  description: string;
  teacher: string;
  url: string;
  price: string;
}

export type CourseList = Course[];
