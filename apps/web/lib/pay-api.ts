import type { CreatePayDto, ResultPay } from "@en/common/pay";
import { serverApi, type Response } from "@/lib/api";

export const createPay = (data: CreatePayDto) =>
  serverApi.post("/pay/create", data) as Promise<Response<ResultPay>>;
