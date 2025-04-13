import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/Customer.entities';
import { CustomerMessages } from './entities/CustomerMessages.entities';
import { Orders } from './entities/Order.entities';
import { OrderItem } from './entities/OrderItem.entities';
import { Payment } from './entities/Payment.entities';
import { Product } from './entities/Product.entities';
import { Shipping } from './entities/Shipping.entities';
import { AiMessages } from './entities/AiMessages.entities';
import { ModelService } from './services/model.services';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Attachments } from './entities/attachment.entities';
import { Payload } from './entities/payload.entities';
import { HelperFunction } from './helperFunction/message.helper';
import { SalesEvent } from './event/SalesEvent';
import { customerService } from './services/customer.services';
import { MessageEventListener } from './event/message.event';
import { SendEmailListener } from './event/email.event';
import { SendMessageListener } from './event/sendSuccessMessage.event';
import { EsewaPaymentHandler } from './event/savePayment.event';
import { MailService } from './services/mailService';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    HttpModule,
    TypeOrmModule.forRootAsync({
      useFactory:(configService:ConfigService)=>({
        type:"mysql",
        database:configService.get("DB_DATABASE"),
        password:configService.get("DB_PASSWORD"),
        username:configService.get("DB_USERNAME"),        
        host:configService.get("DB_HOST"),
        port:+configService.get("DB_PORT"),
        entities:[
          Customer,
          AiMessages,
          CustomerMessages,
          Orders,
          OrderItem,
          Payment,
          Product,
          Shipping,
          Attachments,
          Payload,
        ],
        synchronize:true
      }),
      inject:[ConfigService]
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([
      Customer,
      Attachments,
      CustomerMessages,
      AiMessages,
      Product,
      Payment,
      Shipping,
      OrderItem,
      Orders,
      Payload,
    ])
  ],
  controllers: [AppController],
  providers: [ModelService,SalesEvent,HelperFunction,customerService,MessageEventListener,SendEmailListener,SendMessageListener,EsewaPaymentHandler,MailService],
})
export class AppModule {}

