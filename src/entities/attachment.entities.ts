import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseEntities } from "./BaseEntities.entities";
import { Payload } from "./payload.entities";


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

    @Column({ type: "uuid", nullable: false })
    customerId: string;

    

}