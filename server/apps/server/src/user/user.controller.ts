/// <reference types="multer" />
import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import type {
  UserLogin,
  UserRegister,
  Token,
  UserUpdate,
} from '@en/common/user';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
import type { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 登陆
  @Post('login')
  login(@Body() createUserDto: UserLogin) {
    return this.userService.login(createUserDto);
  }

  // 注册
  @Post('register')
  register(@Body() createUserDto: UserRegister) {
    return this.userService.register(createUserDto);
  }

  // 刷新token 只需要一个参数 refreshToken 就可以了 用 Omit 排除掉 accessToken
  @Post('refresh-token')
  refreshToken(@Body() createUserDto: Omit<Token, 'accessToken'>) {
    return this.userService.refreshToken(createUserDto);
  }

  // 上传头像
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadAvatar(file);
  }

  // 更新用户
  @UseGuards(AuthGuard) // 需要认证才能访问
  @Post('update-user')
  updateUser(@Body() updateUserDto: UserUpdate, @Req() req: Request) {
    const user = req.user;
    return this.userService.updateUser(updateUserDto, user);
  }
}
