/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { customerService } from './services/customer.services';
import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, Res, ValidationPipe } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/Customer.entities';
import { Repository } from 'typeorm';
import { ModelService } from './services/model.services';
import { WebhookEvent } from './meta';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CustomerMessages } from './entities/CustomerMessages.entities';
import { HelperFunction } from './helperFunction/message.helper';
import { Product } from './entities/Product.entities';
import { CreateProductDto, UpdateProductDto } from './Dto/product.dto';
import { plainToInstance } from 'class-transformer';
import { EsewaQueryDto } from './Dto/esewaQueryDto';
import { validate } from 'class-validator';
import { Orders } from './entities/Order.entities';

@Controller()
export class AppController {

  private MessageTimer:Map<string,NodeJS.Timeout> = new Map();
  

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    @InjectRepository(CustomerMessages) private readonly customerMessageRepo: Repository<CustomerMessages>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Orders) private readonly orderRepo: Repository<Orders>,
    private readonly modelService: ModelService,
    private readonly helperFunction:HelperFunction,
    private eventEmitter: EventEmitter2,
    private customerService:customerService
  ) {

  }




  @Get("/webhook")
  getWebhook(@Res() res: Response, @Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {
    try{

      // Check if a token and mode is in the query string of the request
      console.log(this.config.get("verifyToken"))
      if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === this.config.get("verifyToken")) {
          // Respond with the challenge token from the request
          console.log("WEBHOOK_VERIFIED");
          res.status(200).send(challenge);
        } else {
          // Respond with '403 Forbidden' if verify tokens do not match
          res.sendStatus(403);
        }
      }
    }catch(err){
      console.log(err)
    }

  }


  @Post("/webhook")
  async postWebhook(@Req() req: Request, @Res() res: Response, @Body() body: WebhookEvent) {
    if (body.object === "page") {
      for (const entry of body.entry) {

        const webhookEvent = entry.messaging[0];
        const senderPsid = webhookEvent.sender.id;

        const customer = await this.customerRepo.findOneBy({ CustomerId: senderPsid })

        if (!customer) {
          try {
            const customer = await this.customerService.GetUserData(senderPsid)
            if (customer) {
              await this.customerService.SaveCustomer(customer)
            }
          } catch (err) {
            console.log(err)
          }
        }


        if (webhookEvent.message) {
          try {

            console.log(webhookEvent.message)
            // await this.messageEvent.handelMessage({payload:webhookEvent.message,senderId:senderPsid});
            // await this.llmEvent.handelMessage(senderPsid);



            this.eventEmitter.emit('message', {payload:webhookEvent.message,senderId:senderPsid});

            if(this.MessageTimer.has(senderPsid)){
              clearTimeout(this.MessageTimer.get(senderPsid))
            }

            const timer  = setTimeout(() => {
              this.MessageTimer.delete(senderPsid)
              this.eventEmitter.emit('llm', senderPsid);
            },0)
            this.MessageTimer.set(senderPsid,timer)
            console.log("send event")
          } catch (err) {
            console.log(err)
          }
        }

      };


      res.status(200).send("EVENT_RECEIVED");

      // console.log(req)
    } else {
      res.sendStatus(404);
    }
  }


  @Get("/product")
  async getProduct(){
    try{  
      const result = await this.productRepo.find();
      return JSON.stringify(result);
    }catch(err){
      console.log(err)
    }
  }

  @Post('/product')
  async addProduct(@Body(new ValidationPipe({whitelist: true}),) body:CreateProductDto){
    try{
      console.log(body)
      const result = await this.productRepo.save(body)
      return JSON.stringify(result)
    }catch(err){
      console.log(err)
      return new HttpException("cannot save data",HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Put('/product/:id')
async updateProduct(
  @Param('id') id: string,
  @Body() body: UpdateProductDto
): Promise<Product> {
  try {
    const product = await this.productRepo.findOneBy({ id: id });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    const updated = await this.productRepo.save({ ...product, ...body });

    return updated;
  } catch (err) {
    console.error(err);
    throw new HttpException('Cannot save data', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Get('/product/:id')
async getProductById(@Param('id') id: string) {
  try {
    const product = await this.productRepo.findOne({
      where: { id: id },
    });
    console.log(product)

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    return product;
  } catch (err) {
    console.error(err);
    throw new HttpException('Failed to retrieve product', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Delete('/product/:id')
async deleteProduct(@Param('id') id: string) {
  try {

    const product = await this.productRepo.findOne({
      where: { id: id },
    });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }


    await this.productRepo.remove(product);

    return {
      message: 'Product deleted successfully',
      id,
    };
  } catch (err) {
    console.error(err);
    throw new HttpException('Failed to delete product', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Get("/success/:senderId/:orderId/:email")
async PaySuccess(@Param('orderId') orderId:string,@Param('senderId') senderId:string,@Param('email') email:string ,@Query('data') data: string,@Res() res:Response){
  try {
    console.log("Sender ID:", senderId);
    console.log("Email:", email);

    if (!data) throw new BadRequestException("Missing data");

    const decoded = atob(data);
    const json = JSON.parse(decoded);

    const dto = plainToInstance(EsewaQueryDto, json);
    const errors = await validate(dto);
    if (errors.length > 0) {
      console.error(errors);
      throw new BadRequestException("Invalid payment data");
    }

    console.log("Valid eSewa Data:", json);
    this.eventEmitter.emit("savePayment",{...json,senderId:senderId,email:email,orderId:orderId})
    this.eventEmitter.emit("sendEmail",{email:email,orderId:orderId})
    this.eventEmitter.emit("sendMessage",{senderId:senderId,orderId:orderId})

    // Proceed with saving order or updating payment status

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Payment Successful</title>
          <style>
              body { font-family: Arial, sans-serif; padding: 30px; background: #f0fdf4; color: #166534; }
              h1 { font-size: 2rem; }
              .container { max-width: 600px; margin: auto; text-align: center; border: 1px solid #86efac; background: #fff; padding: 2rem; border-radius: 8px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Payment Successful</h1>
              <p>Thank you, <strong>${senderId}</strong>.</p>
              <p>Your transaction was successfully processed.</p>
              <p>A confirmation has been sent to <strong>${email}</strong>.</p>
          </div>
      </body>
      </html>
    `;
    return res.status(200).send(html);
  } catch (err) {
    console.error(err);
    throw new BadRequestException("Failed to verify payment");
  }
}

@Get("/fail/:senderId/:orderId/:email")
  PayFail(
    @Param('senderId') senderId: string,
    @Param('orderId') orderId: string,
    @Param('email') email: string,
    @Query('data') data: string,
    @Res() res:Response
  ) {
    console.log("Payment failed for:", senderId, email);
    console.log("Data:", data);
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Payment Failed</title>
          <style>
              body { font-family: Arial, sans-serif; padding: 30px; background: #fef2f2; color: #b91c1c; }
              h1 { font-size: 2rem; }
              .container { max-width: 600px; margin: auto; text-align: center; border: 1px solid #fca5a5; background: #fff; padding: 2rem; border-radius: 8px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Payment Failed</h1>
              <p>Your payment for sender ID <strong>${senderId}</strong> could not be completed.</p>
              <p>Please try again or contact support.</p>
          </div>
      </body>
      </html>
    `;
    return res.status(200).send(html);
  }


  @Get('/order')
  async getAllOrder(){
    try{
      const data = await this.orderRepo.find({relations:{orderItem:true,payment:true,customer:true}})
      return JSON.stringify(data);
    }catch(err){
      console.log(err)
    }
  }
}
