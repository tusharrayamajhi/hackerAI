import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pinecone } from "@pinecone-database/pinecone";


@Injectable()
export class PineconeService{

    private readonly pinceCone:Pinecone;
    constructor(
        private readonly config:ConfigService
    ){
        this.pinceCone = new Pinecone({
            apiKey:String(this.config.get("PINECONE_API_KEY"))
        })
    }

    

}