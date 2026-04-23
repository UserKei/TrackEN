import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { UserLogin, UserRegister } from '@en/common/user';

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
}
