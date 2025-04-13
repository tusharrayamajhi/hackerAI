import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/services/mailService';

@Injectable()
export class SendEmailListener {

  constructor(private readonly mailService: MailService) {}

  @OnEvent('sendEmail')
  async handleSendEmailEvent(payload: { email: string; orderId: number }) {
    const { email, orderId } = payload;


    // Create email content (text or HTML)
    const subject = `Payment Confirmation for Order #${orderId}`;
    const text = `Dear customer, your payment for Order ID: ${orderId} has been successfully processed. Thank you!`;
    const html = `<p>Dear customer,</p><p>Your payment for <strong>Order ID: ${orderId}</strong> has been successfully processed. Thank you for your purchase!</p>`;

    try {
      await this.mailService.sendMail(email, subject, text, html);
    } catch (error) {
        console.log(error)
    }
  }
}
