import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntities } from "./BaseEntities.entities";
import { Customer } from "./Customer.entities";
import { Attachments} from "./attachment.entities";

@Entity()
export class AiMessages extends BaseEntities {
    @Column({ nullable: false })
    AiMessageId: string

    @Column({ type: "text" })
    AiMessage: string

    @OneToMany(() => Attachments, attachment => attachment.aiMessages, { cascade: true,eager:true })
    attachments: Attachments[]

    @ManyToOne(() => Customer, customer => customer.aiMessage)
    customer: Customer


}