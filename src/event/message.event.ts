import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { AiMessages } from "src/entities/AiMessages.entities";
import { Attachments, AttachmentType } from "src/entities/attachment.entities";
import { Customer } from "src/entities/Customer.entities";
import { CustomerMessages } from "src/entities/CustomerMessages.entities";
import { Payload } from "src/entities/payload.entities";
import { Message } from "src/meta";
import { Repository } from "typeorm";

@Injectable()
export class MessageEventListener{

    constructor(
        @InjectRepository(Customer) private readonly customerRepo:Repository<Customer>,
        @InjectRepository(CustomerMessages) private readonly customerMessageRepo:Repository<CustomerMessages>,
        @InjectRepository(AiMessages) private readonly messageRepo:Repository<AiMessages>,
        @InjectRepository(Attachments) private readonly attachmentRepo:Repository<Attachments>,
        @InjectRepository(Payload) private readonly payloadRepo:Repository<Payload>, 
    ){}

    @OnEvent('message')
    async handelMessage(messageObj:{payload:Message,senderId:string}){
        const payload = messageObj.payload;
        const senderId = messageObj.senderId
        const customer = await this.customerRepo.findOneBy({CustomerId:senderId});
        if(!customer){
            console.log("customer not found");
            console.log("stop calling llm");
            return;
        }

        let text:string = "";
        if(payload.text){
            text = payload.text
        }

        const attachmentsData: Attachments[] = [];
        if(payload.attachments){
            for(const attach of payload.attachments){
                const payloadData = this.payloadRepo.create({
                    url: attach.payload.url,
                    title: attach.payload.title,
                    reel_video_id: attach.payload.reel_video_id,
                    sticker_id: attach.payload.sticker_id
                });
                // const savedPayload = await this.payloadRepo.save(payloadData);
                const attachmentData = this.attachmentRepo.create({
                    payload: payloadData,
                    type:attach.type as AttachmentType,
                });
                // const savedAttachment = await this.attachmentRepo.save(attachmentData);
                attachmentsData.push(attachmentData);
            }
        }
        // let replyTo:string = ""
        // if(payload.reply_to){
        //     replyTo = payload.reply_to.mid;
        // }
        
        const message = this.customerMessageRepo.create({
            CustomerMessageId:payload.mid,
            customer:customer,
            CustomerMessage:text,
            // attachments:attachmentsData,
            // reply_to:replyTo
        })
        await this.customerMessageRepo.save(message);
    }

    

}
