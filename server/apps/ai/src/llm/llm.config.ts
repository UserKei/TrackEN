import { ChatDeepSeek } from '@langchain/deepseek';
import { ConfigService } from '@nestjs/config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { config } from 'dotenv';

// 1. deepseek 初始化
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
// 2. 初始化checkpoint
export const createCheckpoint = async () => {
  const configService = new ConfigService();
  const checkpointer = PostgresSaver.fromConnString(
    configService.get<string>('AI_DATABASE_URL')!,
  );
  await checkpointer.setup();
  return checkpointer;
};
