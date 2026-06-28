/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ChatDeepSeek } from '@langchain/deepseek';
import { ConfigService } from '@nestjs/config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

// 1.1 deepseek 初始化
export const createDeepSeek = () => {
  const configService = new ConfigService();
  return new ChatDeepSeek({
    apiKey: configService.get<string>('DEESEEK_API_KEY'),
    model: configService.get<string>('DEESEEK_API_MODEL'),
    temperature: 1.3, // 翻译 + 通用对话
    maxTokens: 4396, // token 限制
    streaming: true, // 流式输出
  });
};
// 1.2 deepseek 推理初始化
export const createDeepSeekReasoner = () => {
  const configService = new ConfigService();
  return new ChatDeepSeek({
    apiKey: configService.get<string>('DEESEEK_API_KEY'),
    model: configService.get<string>('DEEPSEEK_REASONER_API_MODEL'),
    temperature: 1.3, // 翻译 + 通用对话
    maxTokens: 18000, // token 限制
    streaming: true, // 流式输出
  });
};

// 2. 初始化checkpoint
export const createCheckpoint = async () => {
  const configService = new ConfigService();
  const checkpointer = PostgresSaver.fromConnString(
    configService.get<string>('AI_DATABASE_URL')!,
  );
  await checkpointer.setup();
  return checkpointer;
};

// 3. 初始化bocha搜索API
export const createBochaSearch = async (query: string, count: number = 10) => {
  const configService = new ConfigService();
  const result = await fetch(
    `${configService.get<string>('BOCHA_SEARCH_URL')}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${configService.get<string>('BOCHA_API_KEY')}`,
      },
      body: JSON.stringify({
        query, //查询内容
        count, //查询数量
        summary: true, //摘要
      }),
    },
  );
  const { data } = await result.json();
  const values = data.webPages.value;
  const prompt = values
    .map(
      (item) => `
       标题：${item.name}
       链接：${item.url}
       摘要：${item?.summary?.replace(/\n/g, '') ?? ''}
       网站名称：${item.siteName}
       网站logo：${item.siteIcon}
       发布时间：${item.dateLastCrawled}
    `,
    )
    .join('\n');
  return prompt;
};
