import { MessageEventListener } from './event/message.event';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { customerService } from './services/customer.services';
import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
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
import { LLMEventListener } from './event/llm.event';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import {StructuredOutputParser} from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

@Controller()
export class AppController {

  private MessageTimer:Map<string,NodeJS.Timeout> = new Map();
  

  constructor(
    private readonly config: ConfigService,
    private readonly customerService: customerService,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    @InjectRepository(CustomerMessages) private readonly customerMessageRepo: Repository<CustomerMessages>,
    private readonly modelService: ModelService,
    private readonly helperFunction:HelperFunction,
    private readonly messageEvent:MessageEventListener,
    private readonly llmEvent:LLMEventListener,
    private eventEmitter: EventEmitter2
  ) {

  }




  @Get("/webhook")
  getWebhook(@Res() res: Response, @Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {

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
            },10000)
            this.MessageTimer.set(senderPsid,timer)
            console.log("send event")
          } catch (err) {
            console.log(err)
          }
        }




        else if (webhookEvent.delivery) {
          console.log("Received a message_deliveries event:", webhookEvent);
          // Handle message deliveries
        }
        else if (webhookEvent.echo) {
          console.log("Received a message_echoes event:", webhookEvent);
          // Handle message echoes
        }
        else if (webhookEvent.message_edits) {
          console.log("Received a message_edits event:", webhookEvent);
          // Handle message edits
        }
        else if (webhookEvent.reaction) {
          console.log("Received a message_reactions event:", webhookEvent);
          // Handle message reactions
        }
        else if (webhookEvent.read) {
          console.log("Received a message_reads event:", webhookEvent);
          // Handle message reads (Messenger)
        }
        else if (webhookEvent.messaging_account_linking) {
          console.log("Received a messaging_account_linking event:", webhookEvent);
          // Handle account linking/unlinking
        }
        else if (webhookEvent.messaging_feedback) {
          console.log("Received a messaging_feedback event:", webhookEvent);
          // Handle feedback
        }
        else if (webhookEvent.messaging_game_plays) {
          console.log("Received a messaging_game_plays event:", webhookEvent);
          // Handle game play notifications
        }
        else if (webhookEvent.messaging_handovers) {
          console.log("Received a messaging_handovers event:", webhookEvent);
          // Handle handover protocol changes
        }
        else if (webhookEvent.messaging_optins) {
          console.log("Received a messaging_optins event:", webhookEvent);
          // Handle opt-in events
        }
        else if (webhookEvent.messaging_policy_enforcement) {
          console.log("Received a messaging_policy_enforcement event:", webhookEvent);
          // Handle policy enforcement notifications
        }
        else if (webhookEvent.postback) {
          console.log("Received a messaging_postbacks event:", webhookEvent);
          // Handle postbacks
        }
        else if (webhookEvent.referral) {
          console.log("Received a messaging_referrals event:", webhookEvent);
          // Handle referral events
        }
        else if (webhookEvent.messaging_seen) {
          console.log("Received a messaging_seen event:", webhookEvent);
          // Handle message seen events (Instagram)
        }
        else if (webhookEvent.response_feedback) {
          console.log("Received a response_feedback event:", webhookEvent);
          // Handle response feedback
        }
        else if (webhookEvent.send_cart) {
          console.log("Received a send_cart event:", webhookEvent);
          // Handle cart/order messages
        }
        else if (webhookEvent.standby) {
          console.log("Received a standby event:", webhookEvent);
          // Handle messages when in standby mode
        }


      };


      res.status(200).send("EVENT_RECEIVED");

      // console.log(req)
    } else {
      res.sendStatus(404);
    }
  }


  @Get("/event")
  async emithanderl() {
    // const customers = await this.customerRepo.findOne({relations:{customerMessage:{attachments:{payload:true},}},where:{CustomerId:'7167191503357319'}})
    // const messages = await this.customerMessageRepo.find({where:{customer:Equal(customers?.id)}})
  //  return messages
    // const data = "hit";
  //  console.log(data)
    // this.eventEmitter.emit('first');
    // console.log(data)
  }

  @Get('/image')
  async handelmessage(){
    // console.log("event recived")
    const model = this.modelService.getModel();
    const output = StructuredOutputParser.fromZodSchema(z.array(z.object({
      name:z.string().describe("name"),
      age:z.string().describe("age")
    })))
    const formatoutput = output.getFormatInstructions();
    
    console.log(formatoutput)

    const agent = createToolCallingAgent({
      llm:model,
      prompt: ChatPromptTemplate.fromTemplate(`you are help full assistance {input} {agent_scratchpad} reply in the format of {formatinstructions}`),
      tools:[],
      streamRunnable:true,
    })
    const agentexecutor = new AgentExecutor({agent,tools:[]})
   const res = await agentexecutor.invoke({input:"i am tushar and my friend name is ram. i am 21 years old and he is 20 years old",formatinstructions:formatoutput});
   const finalout = JSON.stringify(res.output);
   console.log(finalout)
   return finalout
  }

  @Get('/esewa')
  payment(){
    const link = this.helperFunction.generatePaymentLink().invoke({senderId:"7167191503357319"})
    return link;
  }

  // async handleMessage(senderId: number, message: { text: string, mid: string, any }) {

  //   try {

  //     const outputParser = new StringOutputParser();
  //     const prompt = ChatPromptTemplate.fromMessages([
  //       ["system", "you help full assistance. you most generate a response under 300 words. if user ask in nepali roman language you should i same roman language"],
  //       ["human", "{message}"]
  //     ])
  //     const chain = prompt.pipe(this.model).pipe(outputParser)
  //     const result = await chain.invoke({ message: message.text })

  //     const response = await axios.post(`https://graph.facebook.com/v21.0/me/messages`,
  //       {
  //         message: {
  //           text: result
  //           //   attachment: {
  //           //     type: 'image',
  //           //     payload: { url: 'https://cubanvr.com/wp-content/uploads/2023/07/ai-image-generators.webp', is_reusable: true }
  //           // }
  //         },
  //         recipient: {
  //           id: senderId
  //         }
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${process.env.MESSANGER_API}`
  //         }
  //       })
  //     console.log(await response.data)
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }
}
