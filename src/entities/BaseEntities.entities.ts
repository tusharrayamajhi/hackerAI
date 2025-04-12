import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export class BaseEntities{

    @PrimaryGeneratedColumn("uuid")
    id:string

    @DeleteDateColumn()
    deletedAt:string

    @CreateDateColumn()
    createdAt:string

    @UpdateDateColumn()
    updatedAt:string
}