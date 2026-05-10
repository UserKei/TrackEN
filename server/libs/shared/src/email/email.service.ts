import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter | null = null;
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: Number(this.configService.get<string>('EMAIL_PORT')),
      secure: !!Number(this.configService.get<string>('EMAIL_USE_SSL')),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    // await this.sendEmail(
    //   '3133481416@qq.com',
    //   '测试邮件',
    //   '这是一封测试邮件，确认邮件服务配置正确。',
    // );
  }

  /**
   *
   * @param to 收件人邮箱地址
   * @param subject 邮件主题
   * @param text 邮件内容
   */
  async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter?.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject,
        html: text,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}
