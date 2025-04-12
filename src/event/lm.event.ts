import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { HelperFunction } from "src/helperFunction/message.helper";
import { ModelService } from "src/services/model.services";

@Injectable()
export class LMEvent{

    constructor(
            private readonly helperFunction: HelperFunction,
            private readonly modelService: ModelService,
            private readonly configService: ConfigService
        ) { }

    @OnEvent('llm')
    async handelmessages(senderId:string){
     
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const history = await this.helperFunction.getHistoryMessage().invoke({ senderId: senderId })
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const message = await this.helperFunction.getUnprocessedMessage().invoke({ senderId: senderId })
                    console.log(message)
                    console.log("message")
                    const reply = this.helperFunction.sendTextResponseToCustomer()
                    const tools = [
                        this.helperFunction.generatePaymentLink(),
                        this.helperFunction.getPaymentMethod(),
                        this.helperFunction.getOrderDetails(),
                        this.helperFunction.getSimilarProduct(),
                        this.helperFunction.saveOrder(),
                        this.helperFunction.getAllProduct()
                    ];
                    const model = new ChatGoogleGenerativeAI({
                        model: "gemini-1.5-flash",
                        apiKey: this.configService.get("GOOGLE_API_KEY"),
                        verbose:true,
                        temperature: 0, // Slightly higher temperature for more natural responses
                        // maxOutputTokens: 500 // Limit response length
                    })
                    const modelWithTool = model.bindTools(tools)
                    const prompt = ChatPromptTemplate.fromMessages([
                        ["system","you are a help full sales assistance who help customer to bye t-shirt"],
                        ["human","{message}"],
                        ["placeholder","{chat_history}"],
                        ["placeholder","{agent_scratchpad}}"]
                    ])
                    const chain = prompt.pipe(modelWithTool)
                    // const res = await chain.invoke({
                    //     senderId:senderId,
                    //     message:[message],
                    //     chat_history:[history]
                    // })
                    // console.log(res)
                    const badlyFormattedMessageObject = {
                        role: "foo",
                        message: "bar",
                        chat_history:[]
                      };
                      
                     const res=  await chain.invoke([badlyFormattedMessageObject]);
                    console.log(res)


        
    }


}