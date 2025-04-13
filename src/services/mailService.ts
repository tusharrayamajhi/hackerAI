/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {

  
  private transporter;

  constructor(
    private readonly config:ConfigService
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',  // You can use other email services (like 'smtp', 'outlook', etc.)
      auth: {
        user: this.config.get("EMAIL"), // Your email address (e.g., example@gmail.com)
        pass: this.config.get("PASS"), // Your email password or app-specific password
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const mailOptions = {
      from: this.config.get("EMAIL"), // Sender address
      to: to, // List of recipients
      subject: subject, // Subject line
      text: text, // Plain text body
      html: html, // HTML body (optional)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
    console.log(info)
    } catch (error) {
        console.log(error)
      throw new Error('Email sending failed');
    }
  }
}
