import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { Orders } from "./Order.entities";
import { BaseEntities } from "./BaseEntities.entities";

@Entity()
export class Payment extends BaseEntities{

    @OneToOne(() => Orders)
    @JoinColumn()
    order: Orders;

    @Column()
    transaction_uuid:string

    @Column({ type: "decimal", precision: 10, scale: 2 })
    total_amount: number;

    @Column({nullable:false})
    transaction_code:string

    @Column({default: "failed" })
    status: string;

    @Column()
    payment_method: string;

    @Column()
    signature:string

    @Column()
    email:string
}


