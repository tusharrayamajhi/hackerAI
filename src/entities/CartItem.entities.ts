import { Entity, Column, ManyToOne } from "typeorm";
import { Product } from "./Product.entities";
import { BaseEntities } from "./BaseEntities.entities";

@Entity()
export class CartItem extends BaseEntities {

    @Column()
    customerId:string;

    @ManyToOne(() => Product, (product) => product.CartItem)
    product: Product;

    @Column()
    quantity: number;
}
