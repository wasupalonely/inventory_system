import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html: string) {
    const info = await this.transporter.sendMail({
      from: `"MyApp" <${this.configService.get('MAIL_USER')}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return info;
  }
}
