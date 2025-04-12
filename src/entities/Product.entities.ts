import { CartItem } from './CartItem.entities';
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntities } from "./BaseEntities.entities";

export enum Size {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
}

@Entity()
export class Product extends BaseEntities {

  @Column({ nullable: false })
  productName: string;

  @Column({ type: "text", nullable: false })
  description: string;

  @Column({ type: "int", unsigned: true, nullable: false })
  price: number;

  @Column({ type: "int", unsigned: true, nullable: false })
  stock: number;

  @Column({ type: "varchar", length: 255, nullable: false })  
  imageUrl: string;

  @Column({ type: "varchar", length: 255, nullable: true })  
  videoLink: string;

  @Column({type: "enum",enum: Size,nullable: false})
  size: Size;

  @Column()
  color:string;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  CartItem: CartItem[];
}
