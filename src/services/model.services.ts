/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { customerService } from "./customer.services";


@Injectable()
export class ModelService{
    private readonly model:ChatGoogleGenerativeAI;
    private readonly prompt = ChatPromptTemplate.fromMessages([
        ['system',`
            you are a sales person.
            act like a sales person.
            you job is to give customer question answer.
            you should do job from answering the user question to checkout
            first you fetch the current message of customer
            second you fetch the historical message of customer and you
            third if user have basic question you reply on you self
            if query is related to product 
            get the product related to customer query
            if query is related to payment 
            use payment tool to get the payment method
            if query is related to payment send use generate payment link tool
            
            
            you can use different tool like
            `],
        ['human','{input}'],
        new MessagesPlaceholder("chat_history"),
    ])
    constructor(private readonly config:ConfigService,private readonly customerService:customerService){
        this.model = new ChatGoogleGenerativeAI({
            model:'gemini-1.5-flash',
            apiKey:this.config.get("GOOGLE_API_KEY"),
            temperature:0.5
        })
    }

    getModel(){
        // const modelWithTools = this.model.bindTools([this.customerService.saveCustomerTool]);
        // const chain = this.prompt.pipe(modelWithTools);
        // const tools :StructuredToolInterface<any>[] = [this.customerService.CustomerTool(),this.customerService.GetUserData()]
        // const agent = await createReactAgent({
            // llm:this.model,
            // prompt:this.prompt,
            // tools:tools
        // })
        // return AgentExecutor.fromAgentAndTools({
            // agent,
            // tools:tools
        // });
        return  this.model;
    }

}