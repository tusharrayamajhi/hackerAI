import { Column, Entity, ManyToOne } from "typeorm";
import { Orders } from "./Order.entities";
import { Product } from "./Product.entities";
import { BaseEntities } from "./BaseEntities.entities";


@Entity()
export class OrderItem extends BaseEntities {

    @ManyToOne(() => Orders, (order) => order.id)
    order: Orders;

    @ManyToOne(() => Product, (product) => product.id)
    product: Product;

    @Column()
    quantity: number;

    @Column("decimal")
    price: number; 

}