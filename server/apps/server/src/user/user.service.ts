import { Injectable } from '@nestjs/common';
import type { UserLogin, UserRegister } from '@en/common/user';
import { PrismaService, ResponseService } from '@libs/shared';
import { Prisma } from '@libs/shared/generated/prisma/client';

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  avatar: true,
  wordNumber: true,
  dayNumber: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) {}
  async login(createUserDto: UserLogin) {
    // phone password
    const user = await this.prisma.user.findUnique({
      where: {
        phone: createUserDto.phone,
      },
    });
    if (!user) {
      return this.response.error(null, '用户不存在');
    }
    if (user.password !== createUserDto.password) {
      return this.response.error(null, '密码错误');
    }
    const updateUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
      select: userSelect,
    });
    return this.response.success(updateUser);
  }

  async register(createUserDto: UserRegister) {
    const data: Prisma.UserCreateInput = {
      name: createUserDto.name,
      phone: createUserDto.phone,
      password: createUserDto.password,
      lastLoginAt: new Date(),
    };
    // name phone email password
    const user = await this.prisma.user.findUnique({
      where: {
        phone: createUserDto.phone,
      },
    });
    if (user) {
      return this.response.error(null, '手机号已存在');
    }

    if (createUserDto.email) {
      const emailUser = await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });
      if (emailUser) {
        return this.response.error(null, '邮箱已存在');
      }
      data.email = createUserDto.email;
    }

    const newUser = await this.prisma.user.create({
      data,
      select: userSelect,
    });
    return this.response.success(newUser);
  }
}
