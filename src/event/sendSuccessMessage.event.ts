import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { HelperFunction } from 'src/helperFunction/message.helper';

@Injectable()
export class SendMessageListener {

    constructor(
        private readonly helperFunction:HelperFunction
    ){}

  @OnEvent('sendMessage')
  async handleSendMessageEvent(payload: { senderId: string; orderId: number }) {
    const { senderId, orderId } = payload;

    await this.helperFunction.sendTextResponseToCustomer().invoke({senderId:senderId,textMessage:`payment successful you order id is${orderId}`})
    await this.helperFunction.sendTextResponseToCustomer().invoke({senderId:senderId,textMessage:"payment bill is send to you email id"})

  }
}
