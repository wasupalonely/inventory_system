import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

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

  async sendMail(to: string, subject: string, url: string, templateType: 'confirm-email' | 'reset-password') {
    let templatePath: string;

    // Seleccionar el archivo HTML según el tipo de plantilla
    if (templateType === 'confirm-email') {
      templatePath = path.join(__dirname, 'confirm-email-template.html');
    } else if (templateType === 'reset-password') {
      templatePath = path.join(__dirname, 'reset-password-template.html');
    }

    // Leer el archivo HTML
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');

    // Reemplazar la variable dinámica en el HTML
    htmlContent = htmlContent.replace('{{ ' + (templateType === 'confirm-email' ? 'confirmationUrl' : 'resetUrl') + ' }}', url);

    // Enviar el correo
    const info = await this.transporter.sendMail({
      from: `"MyApp" <${this.configService.get('MAIL_USER')}>`,
      to,
      subject,
      html: htmlContent, // Usar el contenido HTML modificado
    });

    console.log('Message sent: %s', info.messageId);
    return info;
  }
}
