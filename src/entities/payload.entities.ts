import { Column, Entity, OneToOne } from "typeorm";
import { BaseEntities } from "./BaseEntities.entities";
import { Attachments } from './attachment.entities';

@Entity()
export class Payload extends BaseEntities{
    @Column({type:"varchar",length:1500})
    url?:string

    @Column({nullable:true})
    title?:string

    @Column({nullable:true,type:"bigint"})
    sticker_id?:number

    @Column({nullable:true})
    reel_video_id?:number

    @OneToOne(()=>Attachments,Attachments=>Attachments.payload)
    Attachments:Attachments


}