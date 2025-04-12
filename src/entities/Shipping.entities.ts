import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { Orders } from "./Order.entities";
import { BaseEntities } from "./BaseEntities.entities";

@Entity()
export class Shipping  extends BaseEntities {

    @OneToOne(() => Orders)
    @JoinColumn()
    order: Orders;

    @Column()
    tracking_number: string;

    @Column({ type: "enum", enum: ["pending", "shipped", "delivered"], default: "pending" })
    status: string;

    @Column("text")
    address: string;
}
