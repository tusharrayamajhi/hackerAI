import { Column, Entity } from "typeorm";
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

  @Column({ nullable: false,unique:true })
  productName: string;

  @Column({ type: "text", nullable: false })
  description: string;

  @Column({ type: "varchar", unsigned: false, nullable: false,default:'0' })
  price: string;

  @Column({ type: "int", unsigned: true, nullable: false })
  stock: number;

  @Column({ type: "varchar", length: 255, nullable: false })  
  imageUrl: string;

  @Column({ type: "varchar", length: 255, nullable: true })  
  videoLink: string;

  @Column({type: "simple-array"})
  size: Size[];

  @Column()
  color:string;
}
