"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Course, CourseList } from "@en/common/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayDialog } from "@/components/course/pay-dialog";
import { uploadUrl } from "@/lib/api";
import { getCourseList, getMyCourse } from "@/lib/course-api";
import { useAuth } from "@/hooks/use-auth";

export default function CoursesPage() {
  const router = useRouter();
  const { user, requireAuth } = useAuth();
  const [currentTab, setCurrentTab] = useState("list");
  const [list, setList] = useState<CourseList>([]);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const getList = async (tab = currentTab) => {
    if (tab === "list") {
      const res = await getCourseList();
      setList(res.data);
    } else {
      if (!requireAuth()) return;
      const res = await getMyCourse();
      setList(res.data);
    }
  };

  useEffect(() => {
    void getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, user?.id]);

  const openPay = (course: Course) => {
    if (!requireAuth()) return;
    if (currentTab === "list") {
      setSelectedCourse(course);
      setPayOpen(true);
    } else {
      router.push(
        `/course/learn/${course.id}/${encodeURIComponent(course.name)}`,
      );
    }
  };

  return (
    <div className="min-h-[60vh] bg-secondary/35">
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-12">
        <header className="mb-10 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-normal text-primary">
            Vocabulary Courses
          </p>
          <h1 className="text-3xl font-black">精选课程</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            一次购买，长期有效 · 覆盖高考、考研、四六级、托福雅思等
          </p>
        </header>

        <Tabs
          className="mb-6"
          value={currentTab}
          onValueChange={(value) => setCurrentTab(value)}
        >
          <TabsList>
            <TabsTrigger value="list">精选课程</TabsTrigger>
            {user?.id ? <TabsTrigger value="my">我的课程</TabsTrigger> : null}
          </TabsList>
        </Tabs>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item) => (
            <Card className="overflow-hidden rounded-lg py-0" key={item.id}>
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={`${uploadUrl}${item.url}`}
                  alt={item.name}
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute left-3 top-3 rounded-md bg-background/90 px-2.5 py-1 text-xs font-bold text-muted-foreground shadow-sm">
                  词汇
                </div>
              </div>
              <CardContent className="flex flex-1 flex-col p-5">
                <h2 className="line-clamp-1 text-base font-black">{item.name}</h2>
                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <span className="truncate text-xs text-muted-foreground">
                    讲师 {item.teacher}
                  </span>
                  <span className="text-lg font-black text-primary">¥{item.price}</span>
                </div>
                <Button className="mt-4 w-full" variant="outline" onClick={() => openPay(item)}>
                  {currentTab === "list" ? "购买课程" : "学习课程"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            暂无课程
          </div>
        ) : null}
      </div>
      <PayDialog open={payOpen} course={selectedCourse} onOpenChange={setPayOpen} />
    </div>
  );
}
