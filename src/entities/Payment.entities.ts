import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { Orders } from "./Order.entities";
import { BaseEntities } from "./BaseEntities.entities";

@Entity()
export class Payment extends BaseEntities{

    @OneToOne(() => Orders)
    @JoinColumn()
    order: Orders;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount: number;

    @Column({nullable:false})
    transaction_id:string

    @Column({ type: "enum", enum: ["pending", "completed", "failed"], default: "pending" })
    status: string;

    @Column()
    payment_method: string;
}
