import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { customerService } from './services/customer.services';
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
import { MessageEventListener } from './event/message.event';
import { LLMEventListener } from './event/llm.event';
import { HelperFunction } from './helperFunction/message.helper';
import { CartItem } from './entities/CartItem.entities';
import { LMEvent } from './event/lm.event';

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
          CartItem
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
      CartItem
    ])
  ],
  controllers: [AppController],
  providers: [customerService,ModelService,MessageEventListener,LLMEventListener,HelperFunction,LMEvent],
})
export class AppModule {}

