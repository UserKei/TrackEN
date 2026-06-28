/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import type { RefreshTokenPayload } from '@en/common/user';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    if (!headers.authorization) {
      throw new UnauthorizedException("who're you?");
    }
    try {
      const token = headers.authorization.split(' ')[1];
      const decoded = this.jwtService.verify<RefreshTokenPayload>(token);
      this.jwtService.verify<RefreshTokenPayload>(token);
      request.user = decoded; // payload 存到自定义的 user 属性上 方便后续使用
      return true;
    } catch {
      throw new UnauthorizedException('token is invalid');
    }
  }
}
