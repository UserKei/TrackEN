import { Injectable, OnModuleInit } from '@nestjs/common';
import { createDeepSeek, createCheckpoint } from '../llm/llm.config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import type { ChatRoleType, ChatDto } from '@en/common/chat';
import type { ReactAgent } from 'langchain';
import { chatMode } from '../prompt/prompt.mode';
import { createAgent } from 'langchain';
import { ResponseService } from '@libs/shared';

@Injectable()
export class ChatService implements OnModuleInit {
  constructor(private readonly responseService: ResponseService) {}
  private checkpointer: PostgresSaver;
  private agents: Map<ChatRoleType, ReactAgent> = new Map();

  async onModuleInit() {
    // 1. 初始化 checkpoint
    this.checkpointer = await createCheckpoint(); // 幂等性
    // 2. 创建多个 Agent
    for (const mode of chatMode) {
      const agent = createAgent({
        model: createDeepSeek(), // 模型
        systemPrompt: mode.prompt, // 系统提示词
        checkpointer: this.checkpointer, // 检查点
      });
      this.agents.set(mode.role, agent); // 存储 Agent 实例 Map 中
    }
  }

  streamCompletion(createChatDto: ChatDto) {
    // role -> normal | ...
    // userId -> number
    // content -> string
    // 1. 通过 role 获取对应的 Agent
    const agent = this.agents.get(createChatDto.role);
    if (!agent) {
      throw new Error(`No agent found for role: ${createChatDto.role}`);
    }
    // 2. 组装消息格式
    const id = `${createChatDto.userId}-${createChatDto.role}`;
    const stream = agent.stream(
      {
        messages: [{ role: 'human', content: createChatDto.content }], // 用户消息
      },
      {
        configurable: { thread_id: id }, // 用于做会话隔离
        streamMode: 'messages', // 流式输出消息
      },
    );
    return stream; // 返回的是一个迭代器
  }

  async findAll(userId: string, role: ChatRoleType) {
    const message = await this.checkpointer.get({
      configurable: {
        thread_id: `${userId}-${role}`,
      },
    });
  }
}
