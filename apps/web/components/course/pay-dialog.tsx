"use client";

import { useEffect, useState } from "react";
import type { Course } from "@en/common/course";
import type { CreatePayDto } from "@en/common/pay";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadUrl } from "@/lib/api";
import { createPay } from "@/lib/pay-api";
import { useSocket } from "@/hooks/use-socket";

export function PayDialog({
  open,
  course,
  onOpenChange,
}: {
  open: boolean;
  course: Course | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { socket } = useSocket();
  const [isPaying, setIsPaying] = useState(false);
  const [timeExpire, setTimeExpire] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!open || !socket) return;
    const onPaymentSuccess = () => {
      toast.success("支付成功");
      onOpenChange(false);
    };
    socket.on("paymentSuccess", onPaymentSuccess);
    return () => {
      socket.off("paymentSuccess", onPaymentSuccess);
    };
  }, [onOpenChange, open, socket]);

  useEffect(() => {
    if (!timeExpire) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [timeExpire]);

  useEffect(() => {
    if (!open) {
      setIsPaying(false);
      setTimeExpire(0);
    }
  }, [open]);

  const remainSeconds = Math.max(0, Math.ceil((timeExpire - now) / 1000));

  useEffect(() => {
    if (timeExpire > 0 && remainSeconds === 0) {
      toast.error("支付时间已到，请重新下单");
      setTimeExpire(0);
      setIsPaying(false);
    }
  }, [remainSeconds, timeExpire]);

  const onConfirm = async () => {
    if (!course) return;
    const body: CreatePayDto = {
      subject: course.name,
      body: course.description,
      total_amount: course.price,
      courseId: course.id,
    };
    const res = await createPay(body);
    if (res.code === 200) {
      setIsPaying(true);
      window.open(res.data.payUrl, "_blank");
      setTimeExpire(res.data.timeExpire);
      setNow(Date.now());
    } else {
      toast.error(res.message);
      setIsPaying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>确认支付</DialogTitle>
          <DialogDescription>请核对课程信息后完成支付</DialogDescription>
        </DialogHeader>
        {course ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 rounded-lg bg-secondary/45 p-4">
              <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img
                  src={`${uploadUrl}${course.url}`}
                  alt={course.name}
                  className="size-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-black">{course.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  讲师 {course.teacher}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-accent/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">支付金额</span>
              <span className="text-xl font-black text-primary">¥{course.price}</span>
            </div>
            {remainSeconds > 0 ? (
              <div className="rounded-lg border bg-secondary/45 px-4 py-3 text-center text-sm">
                支付剩余时间：{Math.floor(remainSeconds / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(remainSeconds % 60).toString().padStart(2, "0")}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            暂无课程信息
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button disabled={isPaying || !course} onClick={onConfirm}>
            {isPaying ? "支付中..." : "确认支付"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
