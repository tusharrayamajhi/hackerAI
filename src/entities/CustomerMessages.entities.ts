import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntities } from "./BaseEntities.entities";
import { Customer } from "./Customer.entities";
import { Attachments } from "./attachment.entities";


@Entity()
export class CustomerMessages extends BaseEntities{

    @Column({nullable:false,unique:true})
    CustomerMessageId:string

    @Column({type:"text",nullable:true})
    CustomerMessage:string

    @OneToMany(()=>Attachments,attachment=>attachment.customerMessage,{cascade:true,eager:true})
    attachments:Attachments[]

    @ManyToOne(()=>Customer,customer=>customer.customerMessage)
    customer:Customer

    @Column({type:"boolean",default:false})
    processed:boolean
}