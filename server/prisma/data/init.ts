import {
  PrismaClient,
  TradeStatus,
} from '@libs/shared/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
// import { pg } from '@libs/shared'; // Try to check if I can use pg from shared or just pg directly

// Since seed.ts uses pg indirectly via PrismaPg, I need to make sure I have the pg driver setup if needed,
// but seed.ts didn't import 'pg' explicitly in the snippet shown, although it used PrismaPg.
// Actually, seed.ts snippet showed `import { PrismaPg } from '@prisma/adapter-pg';` but not where `pg` came from.
// I'll assume the environment is same as seed.ts.

const main = async () => {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    }),
  });
  await prisma.$connect();
  console.log('Connected to database');

  const phone = '13333333333';
  const password = 'e10adc3949ba59abbe56e057f20f883e'; // 123456 md5
  const name = '测试全家桶用户';

  // 1. 创建或更新用户
  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: {
      phone,
      password,
      name,
    },
  });

  console.log(`User initialized: ${user.name} (${user.phone})`);

  // 2. 获取所有课程
  const courses = await prisma.course.findMany();

  for (const course of courses) {
    // 检查是否已经拥有该课程
    const existingRecord = await prisma.courseRecord.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
      },
    });

    if (existingRecord) {
      console.log(`Course already owned: ${course.name}`);
      continue;
    }

    // 3. 为每个课程创建支付记录和课程记录
    await prisma.$transaction(async (tx) => {
      const outTradeNo = `INIT-${Date.now()}-${course.value}`;
      const payment = await tx.paymentRecord.create({
        data: {
          userId: user.id,
          outTradeNo,
          amount: course.price,
          subject: `初始化赠送: ${course.name}`,
          body: JSON.stringify({ courseId: course.id, userId: user.id }),
          tradeStatus: TradeStatus.TRADE_SUCCESS,
          sendPayTime: new Date(),
          tradeNo: `ALI-${outTradeNo}`,
        },
      });

      await tx.courseRecord.create({
        data: {
          userId: user.id,
          courseId: course.id,
          isPurchased: true,
          paymentRecordId: payment.id,
        },
      });
    });

    console.log(`Granted course: ${course.name}`);
  }

  await prisma.$disconnect();
  console.log('Initialization complete.');
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
