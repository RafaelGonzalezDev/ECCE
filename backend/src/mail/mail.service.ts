import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    const url = `${this.frontendUrl}/verify-email?token=${token}`;
    
    // Plantilla de HTML con el toque Wow y colores temáticos
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 12px;">
        <h2 style="color: #9333ea; text-align: center;">¡Bienvenido a ECCE, ${name}!</h2>
        <p style="color: #333; font-size: 16px;">Estamos emocionados de tenerte a bordo. Antes de empezar, necesitamos verificar que esta es tu dirección de correo electrónico.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #9333ea; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);">Verificar mi correo</a>
        </div>
        <p style="color: #666; font-size: 14px; text-align: center;">O copia este enlace en tu navegador:<br><a href="${url}" style="color: #9333ea;">${url}</a></p>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Si tú no fuiste quien creó esta cuenta, por favor ignora este correo de forma segura.</p>
      </div>
    `;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'ECCE - Verifica tu correo electrónico',
        html,
      });
      this.logger.log(`Email de verificación enviado a ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando email a ${email}`, error.stack);
      throw error; // Let the auth service decide what to do
    }
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const url = `${this.frontendUrl}/reset-password?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 12px;">
        <h2 style="color: #9333ea; text-align: center;">Recuperación de Contraseña</h2>
        <p style="color: #333; font-size: 16px;">Hola ${name}, hemos recibido una solicitud para restablecer la contraseña de tu cuenta en ECCE.</p>
        <p style="color: #333; font-size: 16px;">Haz clic en el siguiente botón para elegir una nueva contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #9333ea; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);">Restablecer mi Contraseña</a>
        </div>
        <p style="color: #666; font-size: 14px; text-align: center;">O copia este enlace en tu navegador:<br><a href="${url}" style="color: #9333ea;">${url}</a></p>
        <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">Este enlace expirará en 1 hora.</p>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Si tú no solicitaste esto, puedes ignorar este correo de forma segura.</p>
      </div>
    `;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'ECCE - Instrucciones para recuperar tu contraseña',
        html,
      });
      this.logger.log(`Email de recuperación enviado a ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando email de recuperación a ${email}`, error.stack);
      throw error;
    }
  }
}
