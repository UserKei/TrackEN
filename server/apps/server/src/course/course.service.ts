import { Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) {}

  async findAll() {
    const courses = await this.prisma.course.findMany();
    const list = courses.map((item) => ({
      ...item,
      price: Number(item.price).toFixed(2),
    }));
    return this.response.success(list);
  }
}
