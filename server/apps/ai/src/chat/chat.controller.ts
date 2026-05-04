import { Controller, Get, Post, Body, Res, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { ChatDto, ChatRoleType } from '@en/common/chat';
import type { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async create(@Body() createChatDto: ChatDto, @Res() res: Response) {
    // 设置返回的格式是SSE 流式输出
    res.setHeader('Content-Type', 'text/event-stream'); // SSE 流式输出
    res.setHeader('Cache-Control', 'no-cache'); // 不缓存
    res.setHeader('Connection', 'keep-alive'); // 保持连接
    const stream = await this.chatService.streamCompletion(createChatDto);
    for await (const chunk of stream) {
      // console.log('chunk', chunk);
      const [msg] = chunk;
      res.write(
        `data: ${JSON.stringify({ content: msg.content, role: 'ai' })}\n\n`,
      ); // SSE 格式发送消息
    }
    res.end();
  }

  @Get('history')
  findAll(@Query('userId') userId: string, @Query('role') role: ChatRoleType) {
    return this.chatService.findAll(userId, role);
  }
}
