import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { BaseEntities } from "./BaseEntities.entities";
import { Payload } from "./payload.entities";
import { CustomerMessages } from "./CustomerMessages.entities";
import { AiMessages } from "./AiMessages.entities";

export enum AttachmentType {
    AUDIO = "audio",
    FILE = "file",
    IMAGE = "image",
    VIDEO = "video",
    FALLBACK = "fallback",
    REEL = "reel",
    IG_REEL = "ig_reel",
    TEMPLATE = "template"
  }

@Entity()
export class Attachments extends BaseEntities{

    @Column({type:"enum",enum:AttachmentType,nullable:true,default:null})
    type:AttachmentType

    @OneToOne(()=>Payload,payload=>payload.Attachments,{cascade:true,eager:true})
    @JoinColumn()
    payload:Payload

    @ManyToOne(()=>CustomerMessages,message=>message.attachments)
    customerMessage:CustomerMessages

    @ManyToOne(()=>AiMessages,message=>message.attachments)
    aiMessages:AiMessages

}