import { Column, Entity, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseEntities } from "./BaseEntities.entities";
import { Customer } from "./Customer.entities";
import { OrderItem } from "./OrderItem.entities";
import { Payment } from "./Payment.entities";

@Entity()
export class Orders extends BaseEntities{

    @ManyToOne(() => Customer, (customer) => customer.orders, { onDelete: "CASCADE" })
    customer: Customer;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    total_amount: number;

    @OneToOne(() => Payment, (payment) => payment.order)
    payment: Payment;

    @Column()
    status: string

    @OneToMany(()=>OrderItem,(item)=>item.order,{cascade:true,eager:true})
    orderItem:OrderItem[]

}