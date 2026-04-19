import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  getTest(): string {
    return 'Hello world';
  }
}
