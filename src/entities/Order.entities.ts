import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntities } from "./BaseEntities.entities";
import { Customer } from "./Customer.entities";

@Entity()
export class Orders extends BaseEntities{

    @ManyToOne(() => Customer, (customer) => customer.orders, { onDelete: "CASCADE" })
    customer: Customer;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    total_amount: number;

    @Column({ type: "enum", enum: ["pending", "processing", "shipped", "delivered", "canceled"], default: "pending" })
    status: string

}