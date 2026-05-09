import { Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';

@Injectable()
export class LearnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) {}
  // 读取单词列表
  async getWordList(id: string, userId: string) {
    const courseRecord = await this.prisma.courseRecord.findFirst({
      where: {
        userId: userId,
        courseId: id,
        isPurchased: true,
      },
      include: {
        course: true,
      },
    });
    if (!courseRecord) {
      return this.response.error(null, '非法请求');
    }

    const courseType = courseRecord.course.value; // gk zk
    const word = await this.prisma.wordBook.findMany({
      where: {
        [courseType]: true,
        // 掌握的单词不能出现
        wordBookRecords: {
          none: {
            userId: userId,
          },
        },
      },
      skip: 0,
      take: 10,
      orderBy: {
        frq: 'desc',
      },
    });
    this.response.success(word);
  }

  // 保存单词到 wordBookRecord
  async saveWordMaster(wordIds: string[], userId: string) {
    // 1. 将单词保存到 wordBookRecord 表中
    const wordBookRecords = wordIds.map((wordId) => ({
      wordId: wordId,
      userId: userId,
      isMaster: true,
    }));
    await this.prisma.wordBookRecord.createMany({
      data: wordBookRecords,
    });
    // 2. 更新用户学习单词的数量
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        wordNumber: {
          increment: wordIds.length,
        },
      },
    });
    return this.response.success({
      wordNumber: user.wordNumber, // 学习后单词的数量
    });
  }
}
