import { Column, Entity, ManyToOne} from "typeorm";
import { BaseEntities } from "./BaseEntities.entities";
import { Customer } from "./Customer.entities";


@Entity()
export class CustomerMessages extends BaseEntities{

    @Column({nullable:false,unique:true})
    CustomerMessageId:string

    @Column({type:"text",nullable:true})
    CustomerMessage:string

    @ManyToOne(()=>Customer,customer=>customer.customerMessage)
    customer:Customer

    @Column({type:"boolean",default:false})
    processed:boolean
}