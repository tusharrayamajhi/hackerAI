import { Equal } from 'typeorm';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Payment } from 'src/entities/Payment.entities';
import { Orders } from 'src/entities/Order.entities';

@Injectable()
export class EsewaPaymentHandler {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Orders)
    private readonly orderRepository: Repository<Orders>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent("savePayment")
async handlePayment(payload: { senderId: string; email: string; orderId: string; [key: string]: any }) {
  try {
    const { senderId, email, orderId, signature, status, total_amount, transaction_code, transaction_uuid } = payload;

    console.log('Sender ID:', senderId);
    console.log('Email:', email);
    console.log('Order ID:', orderId);

    if (!signature || !status || !total_amount || !transaction_code || !transaction_uuid) {
      throw new BadRequestException('Missing payment fields in payload');
    }

    const order = await this.orderRepository.findOneBy({ id: Equal(orderId) });
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    // Check for existing payment for the same order (to avoid duplicate entries)
    const existingPayment = await this.paymentRepository.findOne({
      where: { order: { id: orderId } },
    });

    if (existingPayment) {
      throw new BadRequestException('Payment already exists for this order');
    }

    const payment = this.paymentRepository.create({
      email: email,
      payment_method: 'esewa',
      order: order,
      signature,
      status,
      total_amount,
      transaction_code,
      transaction_uuid,
    });

    const saved = await this.paymentRepository.save(payment);
    console.log('Payment saved:', saved);
  } catch (err) {
    console.error('Payment processing error:', err);
  }
}

}

