import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "src/entities/Customer.entities";
import { Product } from "src/entities/Product.entities";
import { checkprompt,messageToCustomerPrompt,paymentPrompt } from "src/helperFunction/getprompt";
import { HelperFunction } from "src/helperFunction/message.helper";
import { ModelService } from "src/services/model.services";
import { Repository } from "typeorm";
import { z } from "zod";

@Injectable()
export class SalesEvent{


    
        constructor(
                    private readonly helperFunction: HelperFunction,
                    private readonly modelService: ModelService,
                    private readonly configService: ConfigService,
                    private eventEmitter: EventEmitter2,
                    @InjectRepository(Product) private productRepo:Repository<Product>,
                    @InjectRepository(Customer) private customerRepo:Repository<Customer>,
                    
                    
                    
                ) {}

        @OnEvent("llm")
        async sales(senderId:string){
            try{
                const customer = await this.customerRepo.findOne({where:{CustomerId:senderId}})
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const history = await this.helperFunction.getHistoryMessage().invoke({senderId:senderId})
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const message = await this.helperFunction.getUnprocessedMessage().invoke({ senderId });
                const product = await this.productRepo.find();


                const model = new ChatGoogleGenerativeAI({
                    apiKey:this.configService.get("GOOGLE_API_KEY"),
                    temperature:0.2,
                    model:"gemini-1.5-flash"

                })


                    const checkoutput = StructuredOutputParser.fromZodSchema(z.object(
                        {
                            funcationname:z.string().describe('function name')
                        }
                    ))
                    const chain = checkprompt.pipe(model).pipe(checkoutput);

                    const resposne = await chain.invoke(
                        {chat_history:[history],message:[message],formate_instruction:checkoutput.getFormatInstructions()}
                    )
                    console.log(resposne)

                    if(resposne.funcationname == "sendMessageToCustomer"){
                        
                        const outpurparser2 = StructuredOutputParser.fromZodSchema(z.array(z.object({
                            imageUrl:z.string().describe("image url of tshirt if you don't want to send image just send empty string but if you want to send image insert link here"),
                            message:z.string().describe("message to customer if you want to send a product send in formate of price:amount\n size:comma separate \n name:name of the tshirt \n color:color of tshirt"),
                        })))
                        const chain2 = messageToCustomerPrompt.pipe(model).pipe(outpurparser2);
                        const response = await chain2.invoke({customer_details:customer,chat_history:[history],message:[message],product:product,format_instruction:outpurparser2.getFormatInstructions()})
                        for(const msg of response){
                            console.log(msg)
                            if(msg.imageUrl){
                                await this.helperFunction.sendAttachmentResponseToCustomer().invoke({senderId:senderId,attachment:{type:"image",payload:{url:msg.imageUrl}}})
                            }
                            if(msg.message){
                                await this.helperFunction.sendTextResponseToCustomer().invoke({senderId:senderId,textMessage:msg.message})
                            }
                        }
                    }else if(resposne.funcationname == "sendPaymentLinkToCustomer"){
                        
                            const outputparser3 = StructuredOutputParser.fromZodSchema(z.object({
                                product:z.array(z.object({
                                    productName:z.string().describe("name of the tshirt that customer select to order"),
                                    quantity:z.string().describe("no of order quantity from customer"),
                                    size:z.string().describe("size that customer want to buy")
                                })),
                                shippingaddress:z.string().describe("shipping address of customer"),
                                email:z.string().describe("email of customer where confirmation mail is sent")
                                
                            }))
                            const chain3 = paymentPrompt.pipe(model).pipe(outputparser3)
                            const response = await chain3.invoke({chat_history:[history],message:[message],formate_instruction:outputparser3.getFormatInstructions(),customer_details:customer})
                            console.log(response)
                            await this.helperFunction.sendTextResponseToCustomer().invoke({senderId:senderId,textMessage:JSON.stringify(response.product)})
                            await this.helperFunction.generatePaymentLink().invoke({senderId:senderId,product:response.product,shippingAddress:response.shippingaddress,email:response.email})
                    }


                
            }catch(err){
                console.log(err)
            }
        }

}