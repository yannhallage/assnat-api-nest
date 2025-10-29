import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST!,
            port: parseInt(process.env.SMTP_PORT!),
            secure: true,
            auth: {
                user: process.env.SMTP_USER!,
                pass: process.env.SMTP_PASS!,
            },
        });
    }

    async sendInvitationEmail(email: string, password: string, nom: string, prenom: string): Promise<void> {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM!,
                to: email,
                subject: 'Invitation à rejoindre le système de gestion des congés',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">Bienvenue dans le système de gestion des congés</h2>
                        <p>Bonjour ${prenom} ${nom},</p>
                        <p>Vous avez été invité à rejoindre le système de gestion des congés de l'Assemblée nationale.</p>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #495057;">Vos identifiants de connexion :</h3>
                        <p><strong>Email :</strong> ${email}</p>
                        <p><strong>Mot de passe temporaire :</strong> ${password}</p>
                        </div>
                        <p style="color: #dc3545;"><strong>Important :</strong> Veuillez changer votre mot de passe lors de votre première connexion.</p>
                        <p>Vous pouvez maintenant vous connecter au système et commencer à utiliser vos fonctionnalités.</p>
                        <p>Cordialement,<br>L'équipe RH</p>
                    </div>
                    `,
            };

            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email d'invitation envoyé avec succès`);
        } catch (error: any) {
            this.logger.error(`Erreur lors de l'envoi de l'email :`, error.message);
            throw error;
        }
    }

    async sendNotificationEmail(email: string, subject: string, message: string): Promise<void> {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM!,
                to: email,
                subject: subject,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">${subject}</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              ${message}
            </div>
            <p>Cordialement,<br>L'équipe RH</p>
          </div>
        `,
            };

            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email de notification envoyé avec succès`);
        } catch (error: any) {
            this.logger.error(`Erreur lors de l'envoi de l'email de notification :`, error.message);
            throw error;
        }
    }
}
