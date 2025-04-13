import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntities } from "./BaseEntities.entities";
import { CustomerMessages } from "./CustomerMessages.entities";
import { AiMessages } from "./AiMessages.entities";
import { Orders } from "./Order.entities";


@Entity()
export class Customer extends BaseEntities{
    @Column({nullable:false,unique:true})
    CustomerId:string

    @Column()
    fullName:string

    @Column()
    email:string

    @OneToMany(()=>CustomerMessages,customerMessages => customerMessages.customer)
    customerMessage:CustomerMessages[]

    @OneToMany(()=>AiMessages,aiMessage => aiMessage.customer)
    aiMessage:AiMessages[]

    @OneToMany(() => Orders, (order) => order.customer,{cascade:true,eager:true})
    orders: Orders[];

    
}