import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

const transformBigInt = (data: any) => {
  if (typeof data === 'bigint') {
    return data.toString();
  }

  if (Array.isArray(data)) {
    return data.map(transformBigInt);
  }

  if (typeof data === 'object' && data !== null) {
    if (data instanceof Date) return data;
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, transformBigInt(value)]),
    );
  }

  return data;
};

@Injectable()
export class InterceptorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    return next.handle().pipe(
      map((data: unknown) => {
        return {
          timestamp: new Date().toISOString(),
          data: data,
          path: request.url,
          message: 'success',
          code: 200,
          success: true,
        };
      }),
    );
  }
}
