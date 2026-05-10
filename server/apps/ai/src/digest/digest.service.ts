import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
import dayjs from 'dayjs';
import { createAgent } from 'langchain';
import { createDeepSeek } from '../llm/llm.config';
import { tool } from '@langchain/core/tools';
import marked from 'marked';
import { Queue } from 'bullmq'; // 类型
import { digestQueueName } from './digest.queue'; // 名称
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class DigestService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(digestQueueName.name) private readonly digestQueue: Queue,
  ) {}

  private queryTool() {
    return tool(
      async ({ userId }: { userId: string }) => {
        const user = await this.prismaService.user.findFirst({
          where: {
            id: userId,
          },
          select: {
            email: true,
            name: true,
            wordNumber: true,
            wordBookRecords: {
              where: {
                createdAt: {
                  gte: dayjs().startOf('day').toDate(), // 今天开始的时间
                  lte: dayjs().endOf('day').toDate(), // 今天结束的时间
                },
              },
              select: {
                word: {
                  select: {
                    word: true,
                  },
                },
              },
            },
          },
        });
        return user;
      },
      {
        name: 'queryTool', // 名字一定要语义化
        description: '根据用户 id 查询用户当天学习的单词记录',
        // JSON Schema，定义输入参数的结构和类型，方便模型理解和使用
        schema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: '用户 id',
            },
          },
          required: ['userId'],
        },
      },
    );
  }

  async onModuleInit() {
    await this.digestQueue.add(
      digestQueueName.task.everyDayDigest,
      {},
      {
        repeat: {
          pattern: '0 0 * * *', // 每天凌晨执行一次
        },
      },
    );
  }

  async handleEmailDigest() {
    // 筛选
    await this.digestQueue.add(digestQueueName.task.emailDigest, {
      userId: '1dfasdf11',
    });
    const userIds = await this.prismaService.user.findMany({
      where: {
        isTimingTask: true, // 开启了定时任务
        timingTaskTime: { not: '' }, // 定时任务时间不为空
        email: { not: null }, // 邮箱不为空
        wordBookRecords: {
          some: {
            createdAt: {
              gte: dayjs().startOf('day').toDate(), // 今天开始的时间
              lte: dayjs().endOf('day').toDate(), // 今天结束的时间
            },
          },
        },
      },
      select: {
        id: true,
        timingTaskTime: true,
        email: true,
      },
    });

    for (const user of userIds) {
      const agent = createAgent({
        model: createDeepSeek(),
        tools: [this.queryTool()],
        systemPrompt:
          '你是一个智能助手，负责根据用户当天学习的单词记录生成学习总结邮件内容。请根据以下要求生成邮件内容：\n\n1. 邮件内容应该包含用户当天学习的单词列表，每个单词都要显示出来。\n2. 邮件内容应该简洁明了，突出重点。\n3. 邮件内容应该具有激励性，鼓励用户继续学习。\n4. 邮件内容应该使用友好和积极的语言。\n\n请根据以上要求生成邮件内容。',
      });

      const result = await agent.invoke({
        messages: [
          {
            role: 'user',
            content: `查询用户信息，并且根据用户 id 关联单词记录表，调查出用今天的单词记录，用户 id : ${user.id}`,
          },
        ],
      });
      const content = result.messages.at(-1)?.content;
      if (content) {
        const html = await marked.parse(content as string);
        const [hour, minute, second] = user.timingTaskTime
          .split(':')
          .map(Number);
        const target = dayjs()
          .startOf('day')
          .add(hour, 'hour')
          .add(minute, 'minute')
          .add(second, 'second');
        let delay = target.diff(dayjs());
        if (delay < 0) {
          delay = 0;
        }
        await this.digestQueue.add(
          digestQueueName.task.emailDigest,
          {
            userId: user.id,
            text: html,
            email: user.email,
          },
          {
            delay: delay,
          },
        );
      }
    }
  }
}
