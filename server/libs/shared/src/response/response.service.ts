import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
  success(data: any = null, message: string = 'Success', code: number = 200) {
    return {
      data,
      message,
      code,
    };
  }
  error(message: string = 'fail', code: number = 500) {
    return {
      message,
      code,
    };
  }
}
