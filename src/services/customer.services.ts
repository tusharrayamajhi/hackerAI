/* eslint-disable @typescript-eslint/no-unsafe-return */
import { HttpException, Injectable } from "@nestjs/common";
import { Customer } from "src/entities/Customer.entities";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios, { HttpStatusCode } from "axios";

@Injectable()
export class customerService {

    constructor(@InjectRepository(Customer) private readonly customerRepo: Repository<Customer>) { }


    async SaveCustomer(customer: { id: string, name: string }) {
        try {
            const cos = this.customerRepo.create({ CustomerId: customer.id, fullName: customer.name})
            return await this.customerRepo.save(cos)
        } catch (err) {
            console.log(err)
            return new HttpException("cannot save customer data in database", HttpStatusCode.InternalServerError)
        }
    }

    async GetUserData(senderId: string) {
    try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${senderId}?fields=id,name,profile_pic&access_token=${process.env.MESSANGER_API}`);
        console.log(response.data)
        return response.data
    } catch (err) {
        console.log(err)
    }
}
}