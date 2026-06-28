/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import type { CreatePayDto } from '@en/common/pay';
import type { TokenPayload } from '@en/common/user';
import {
  PrismaService,
  PayService as SharedPayService,
  ResponseService,
} from '@libs/shared';
import * as nanoid from 'nanoid';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { TradeStatus } from '@libs/shared/generated/prisma/enums';
import { SocketGateway } from '../socket/socket.gateway';

type NotifyBody = {
  app_id?: string;
  out_trade_no?: string;
  trade_no?: string;
  trade_status?: string;
  total_amount?: string;
  body?: string;
  gmt_payment?: string;
};

@Injectable()
export class PayService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly responseService: ResponseService,
    private readonly socketGateway: SocketGateway,
    private readonly sharedPayService: SharedPayService,
  ) {}

  private createTradeNo() {
    const prifix = 'XM'; //订单前缀
    return `${prifix}-${nanoid.nanoid(12)}`;
  }

  private getNotifyUrl() {
    return `${this.configService.get<string>('ALIPAY_NOTIFY_URL')!}/api/v1/pay/notify`;
  }

  private buildPayBody(createPayDto: CreatePayDto, user: TokenPayload) {
    return JSON.stringify({
      courseId: createPayDto.courseId,
      userId: user.userId,
    });
  }

  async create(createPayDto: CreatePayDto, user: TokenPayload) {
    //购买过课程不能重复购买
    const courseRecord = await this.prismaService.courseRecord.findFirst({
      where: {
        userId: user.userId,
        courseId: createPayDto.courseId,
      },
    });
    if (courseRecord) {
      return this.responseService.error(null, '您已经购买过该课程');
    }
    const result = await this.prismaService.$transaction(async (tx) => {
      //1. 创建订单表 但是状态是未支付
      const outTradeNo = this.createTradeNo();
      await tx.paymentRecord.create({
        data: {
          userId: user.userId, //用户id
          outTradeNo: outTradeNo, //订单编号
          amount: createPayDto.total_amount, //支付金额
          subject: createPayDto.subject, //支付主题
          body: createPayDto.body, //支付内容
        },
      });
      //2.支付宝SDK发起支付生成url
      const dateTime = dayjs().add(1, 'minute'); //当前的时间增加了一分钟 为了测试我弄的快一点
      const channel = createPayDto.channel ?? 'web';
      const body = this.buildPayBody(createPayDto, user);
      const bizContent = {
        out_trade_no: outTradeNo, //订单编号
        total_amount: createPayDto.total_amount, //支付金额
        subject: createPayDto.subject, //支付主题
        body, //支付内容
        product_code:
          channel === 'app' ? 'QUICK_MSECURITY_PAY' : 'FAST_INSTANT_TRADE_PAY',
        time_expire: dateTime.format('YYYY-MM-DD HH:mm:ss'),
      };
      if (channel === 'app') {
        const orderInfo = this.sharedPayService
          .getAlipaySdk()
          .sdkExecute('alipay.trade.app.pay', {
            bizContent,
            notifyUrl: this.getNotifyUrl(),
          });
        return {
          channel,
          orderInfo,
          outTradeNo,
          timeExpire: dateTime.toDate().getTime(),
        };
      }
      const payUrl = this.sharedPayService
        .getAlipaySdk()
        .pageExecute('alipay.trade.page.pay', 'GET', {
          bizContent,
          notify_url: this.getNotifyUrl(),
        });
      return {
        channel,
        payUrl, //返回支付宝的支付链接
        outTradeNo,
        timeExpire: dateTime.toDate().getTime(), //迎合Elementplus组件要求是时间戳
      };
    });
    return this.responseService.success(result);
  }

  async notify(req: Request) {
    const body = req.body as NotifyBody;
    const isVerified = this.sharedPayService
      .getAlipaySdk()
      .checkNotifySignV2(body);
    if (!isVerified) {
      return 'failure';
    }

    const expectedAppId = this.configService.get<string>('ALIPAY_APP_ID');
    if (body.app_id && expectedAppId && body.app_id !== expectedAppId) {
      return 'failure';
    }

    const outTradeNo = body.out_trade_no;
    const tradeStatus = body.trade_status;
    if (!outTradeNo || !tradeStatus) {
      return 'failure';
    }

    if (
      tradeStatus !== TradeStatus.TRADE_SUCCESS &&
      tradeStatus !== TradeStatus.TRADE_FINISHED
    ) {
      return 'success';
    }

    try {
      await this.prismaService.$transaction(async (tx) => {
        const existingPaymentRecord = await tx.paymentRecord.findUnique({
          where: {
            outTradeNo,
          },
        });
        if (!existingPaymentRecord) {
          throw new Error(`Payment record not found: ${outTradeNo}`);
        }
        if (
          body.total_amount &&
          Number(existingPaymentRecord.amount.toString()) !==
            Number(body.total_amount)
        ) {
          throw new Error(`Payment amount mismatch: ${outTradeNo}`);
        }
        if (
          existingPaymentRecord.tradeStatus === TradeStatus.TRADE_SUCCESS ||
          existingPaymentRecord.tradeStatus === TradeStatus.TRADE_FINISHED
        ) {
          return;
        }
        //1.更新支付库 支付时间 + 支付宝交易号 + 支付状态
        const paymentRecord = await tx.paymentRecord.update({
          where: {
            outTradeNo, //拿到了订单编号
          },
          data: {
            tradeNo: body.trade_no, //拿到了支付宝交易号
            tradeStatus: tradeStatus as TradeStatus, //拿到了支付状态
            ...(body.gmt_payment
              ? { sendPayTime: dayjs(body.gmt_payment).toDate() }
              : {}), //拿到了支付时间
          },
        });
        //2.创建我的课程
        const payBody = JSON.parse(body.body ?? '{}') as {
          courseId: string;
          userId: string;
        };
        await tx.courseRecord.upsert({
          where: {
            userId_courseId: {
              userId: payBody.userId,
              courseId: payBody.courseId,
            },
          },
          update: {
            isPurchased: true,
            paymentRecordId: paymentRecord.id,
          },
          create: {
            userId: payBody.userId, //拿到了用户id
            courseId: payBody.courseId, //拿到了课程id
            isPurchased: true,
            paymentRecordId: paymentRecord.id,
          },
        });
        //加一个通知前端socket
        this.socketGateway.emitPaymentSuccess(payBody.userId);
      });
    } catch {
      return 'failure';
    }
    return 'success';
  }
}
