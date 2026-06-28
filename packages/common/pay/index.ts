export type PayChannel = 'web' | 'app';

//packages/common/pay/index.ts
export interface CreatePayDto {
  subject: string; //订单标题
  body: string; //附加信息 可以自定义内容
  total_amount: string; //订单金额
  courseId: string; //课程ID
  channel?: PayChannel; // 支付渠道
}

export interface ResultPay {
  channel: PayChannel; //支付渠道
  payUrl?: string; //网页支付URL
  orderInfo?: string; //App支付order string
  outTradeNo: string; //商户订单号
  timeExpire: number; //过期时间
}
