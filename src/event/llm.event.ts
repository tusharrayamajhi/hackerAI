// /* eslint-disable @typescript-eslint/restrict-plus-operands */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { AgentExecutor, createToolCallingAgent,ChatConversationalAgent } from 'langchain/agents';
// import { ModelService } from '../services/model.services';
// import { OnEvent } from '@nestjs/event-emitter';
// import { Injectable } from "@nestjs/common";
// import { HelperFunction } from 'src/helperFunction/message.helper';
// import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
// import { ConfigService } from '@nestjs/config';
// import { ChatPromptTemplate } from '@langchain/core/prompts';
// import { StructuredOutputParser } from '@langchain/core/output_parsers';
// import { z } from 'zod';

// @Injectable()
// export class LLMEventListener {


//     // private context = `
//     // you are a sales agent for a clothing retailer that offers a wide variety of apparel for men, women, and children.
//     // Our product range includes casual wear, formal wear, sportswear, and accessories. 
//     // You are knowledgeable about current fashion trends, sizing, materials, and care instructions.
//     // You are skilled at helping customers find the right items to suit their needs and preferences,
//     // and you provide recommendations based on their stated style.
//     // You aim to provide detail information and make the customer buy the product`

//     // private prompt = ChatPromptTemplate.fromTemplate(`
//     //     you are a helpful ai assistance who reply the customer question  
//     //     - Sender ID: {senderId}
//     //     - message: {message}
//     //     - chat_history: {chat_history}
//     //     - context: {context}

//     //     **Instructions:**
//     //     1. Analyze the customer's current message and their conversation history.
//     //     2. Use the appropriate tools to gather necessary information.
//     //     3. Formulate a helpful response based on the context.
//     //     4. if you want to send a payment link just send a link only not extra information in same text
//     //     5. if customer select the product then get that product from get all product and send product id and other information to order
//     //     6. act like real person not ai you are real person who answer customer question and guide from give information about product to order to payment 
//     //     {agent_scratchpad}
//     //     reply in the format of
//     //     {format_instructions}
//     // `);



//     private intentPrompt = ChatPromptTemplate.fromTemplate(`
//         Classify the customer's intent based on this message:
//         "{message}"
        
//         Choose the most relevant intent from the following list:
        
//         - ask_product_info         // Customer is asking about a product (e.g., color, size, availability)
//         - browse_products          // Customer wants to see or explore options
//         - order_product            // Customer wants to place an order
//         - cancel_order             // Customer wants to cancel an order
//         - ask_payment              // Customer is asking how to pay or requests payment options
//         - confirm_payment          // Customer confirms they have made a payment
//         - general_greeting         // Casual greeting like "hi", "hello", etc.
//         - complaint_or_issue       // Customer has a problem or complaint
//         - ask_return_policy        // Customer wants to know about return/exchange policy
//         - ask_delivery_status      // Asking about shipping or delivery timeline
//         - ask_discount_or_offer    // Customer is inquiring about discounts or offers
//         - thank_you                // Customer is thanking after assistance
//         - other                    // Anything that doesn’t fit above
        
//         Just return the intent id only.
//         `);
        


//     private context = `
//   You are a sales agent for a T-shirt retailer that offers a wide variety of T-shirts for men, women, and children.
//   Our product range includes plain, printed, oversized, graphic, and seasonal T-shirts in different colors, sizes, and materials.
//   You are knowledgeable about T-shirt styles, fits, sizing, materials, and care instructions.
//   Your job is to help customers find the perfect T-shirt based on their preferences and guide them through the process — from choosing a product to placing an order and completing payment.
//   You must act like a real human assistant — friendly, helpful, and sales-driven.
// `;

// private prompt = ChatPromptTemplate.fromTemplate(`
// You are a helpful T-shirt sales assistant who replies to customer messages.  

// - Sender ID: {senderId}
// - message: {message}
// - chat_history: {chat_history}
// - context: {context}
// - intent: {intent}

// **Instructions:**
// 1. Analyze the customer's current message and their conversation history.
// 2. Use the appropriate tools or functions to find matching T-shirts.
// 3. Provide helpful responses based on their preferences (style, color, size, etc.).
// 4. If the customer selects a T-shirt, fetch the product info using "get all products", and send its **product ID**, name, and other necessary details to proceed with the order.
// 5. If it's time for payment, send the **payment link only**, without adding extra text in the same message.
// 6. Act like a real human — friendly and convincing. You are not an AI, you are a real sales assistant.

// {agent_scratchpad}
// if you want to give many different message not in single use this format rank for when to send first second third etc and reply as message
// {format_instructions}

// example:
// customer: hi
// reply:{{
// rank:1,
// reply:hello
// }}
// customer:i want to bye a t-shirt
// reply:{{
// rank:1,
// reply:we have follow t-shirt,
// }}


// `);



//     constructor(
//         private readonly helperFunction: HelperFunction,
//         private readonly modelService: ModelService,
//         private readonly configService: ConfigService
//     ) { }

//     @OnEvent('llm')
//     async handelMessage(senderId: string) {
//         try {
//             // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//             const history = await this.helperFunction.getHistoryMessage().invoke({ senderId: senderId })
//             // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//             const message = await this.helperFunction.getUnprocessedMessage().invoke({ senderId: senderId })
//             console.log(message)
//             console.log("message")
//             const reply = this.helperFunction.sendTextResponseToCustomer()
//             const tools = [
//                 this.helperFunction.generatePaymentLink(),
//                 this.helperFunction.getPaymentMethod(),
//                 this.helperFunction.getOrderDetails(),
//                 // this.helperFunction.getSimilarProduct(),
//                 this.helperFunction.saveOrder(),
//                 this.helperFunction.getAllProduct()
//             ];
//             console.log(tools);
//             const model = new ChatGoogleGenerativeAI({
//                 model: "gemini-1.5-flash",
//                 apiKey: this.configService.get("GOOGLE_API_KEY"),
//                 temperature: 0, // Slightly higher temperature for more natural responses
//                 // maxOutputTokens: 500 // Limit response length
//             })

//             const messageprompt = ChatPromptTemplate.fromTemplate(`make standalone message for given to llm {message}`)
//             const finalmessag = await messageprompt.pipe(model).invoke({ message: message });
//             // console.log(finalmessag)

//             const intentmodel  = this.intentPrompt.pipe(model);
//             const res = await intentmodel.invoke({message:finalmessag});
//             // eslint-disable-next-line @typescript-eslint/no-base-to-string
//             console.log("intent dected" + res.content)

//             // const prompt = await pull<ChatPromptTemplate>("hwchase17/openai-tools-agent");
//             // console.log(prompt)

//             const agent = createToolCallingAgent({
//                 llm: model,
//                 tools: tools,
//                 prompt: this.prompt,
                
//             })
//             console.log(agent)

//             const agentExecutor = new AgentExecutor({
//                 agent,
//                 // maxIterations: 2,
//                 tools
//             });
//             console.log(agentExecutor)

//             // const output = StructuredOutputParser.fromZodSchema(z.array(z.object({
//             //     rank: z.number().describe("rank of the reply when should we should send this at 1 2 or when"),
//             //     reply: z.string().describe("reply")
//             // })))
//             // const formatoutput = output.getFormatInstructions();

//             // const result = await agentExecutor.invoke({
//             //     message: finalmessag,
//             //     senderId: senderId,
//             //     chat_history: history,
//             //     context: this.context,
//             //     format_instructions: formatoutput,
//             //     intent:res
//             // });

//             // console.log(result)
            
//             // await reply.invoke({ senderId: senderId, textMessage: result.output })

//             // console.log(result)

//             // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
//             // const res = await this.helperFunction.sendTextResponseToCustomer().invoke({ senderId: senderId, textMessage:  })
//             // console.log(res)
//         } catch (err) {
//             console.error('Error in LLM Event Handler:', err);
//             throw err
//         }



//     }
// }







/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ModelService } from '../services/model.services';
import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from "@nestjs/common";
import { HelperFunction } from 'src/helperFunction/message.helper';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ConfigService } from '@nestjs/config';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

@Injectable()
export class LLMEventListener {


    // private context = `
    // you are a sales agent for a clothing retailer that offers a wide variety of apparel for men, women, and children.
    // Our product range includes casual wear, formal wear, sportswear, and accessories. 
    // You are knowledgeable about current fashion trends, sizing, materials, and care instructions.
    // You are skilled at helping customers find the right items to suit their needs and preferences,
    // and you provide recommendations based on their stated style.
    // You aim to provide detail information and make the customer buy the product`

    // private prompt = ChatPromptTemplate.fromTemplate(`
    //     you are a helpful ai assistance who reply the customer question  
    //     - Sender ID: {senderId}
    //     - message: {message}
    //     - chat_history: {chat_history}
    //     - context: {context}

    //     **Instructions:**
    //     1. Analyze the customer's current message and their conversation history.
    //     2. Use the appropriate tools to gather necessary information.
    //     3. Formulate a helpful response based on the context.
    //     4. if you want to send a payment link just send a link only not extra information in same text
    //     5. if customer select the product then get that product from get all product and send product id and other information to order
    //     6. act like real person not ai you are real person who answer customer question and guide from give information about product to order to payment 
    //     {agent_scratchpad}
    //     reply in the format of
    //     {format_instructions}
    // `);



    private intentPrompt = ChatPromptTemplate.fromTemplate(`
        Classify the customer's intent based on this message:
        "{message}"
        
        Choose the most relevant intent from the following list:
        
        - ask_product_info                 
        - order_product            
        - cancel_order             
        - ask_payment              
        - confirm_payment           
        - general_greeting                 
        - ask_delivery_status           
        - thank_you                
        - other                    
        
        Just return the intent id only.
        `);
        


    private context = `
  You are a sales agent for a T-shirt retailer that offers a wide variety of T-shirts for men, women, and children.
  Our product range includes plain, printed, oversized, graphic, and seasonal T-shirts in different colors, sizes, and materials.
  You are knowledgeable about T-shirt styles, fits, sizing, materials, and care instructions.
  Your job is to help customers find the perfect T-shirt based on their preferences and guide them through the process — from choosing a product to placing an order and completing payment.
  You must act like a real human assistant — friendly, helpful, and sales-driven.
`;

private prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful T-shirt sales assistant who replies to customer messages.  

- Sender ID: {senderId}
- message: {message}
- chat_history: {chat_history}
- context: {context}

**conversation flow of and ai sales agent:**
1: greeting in this you greet a customer in friendly way
2: query answer the customer query 
3: about t-shirt answer the customer query about t-shirt
4: adding t-shirt to carts add selected t-shirt to carts
5: confirm payment if customer confirm a payment called payment generate tool

always ask flow off question link after selecting t-shirt ask do you add to carts. 
if t-shirt is added to carts ask do you want to add more t-shirt or continue to payment

{agent_scratchpad}

`);




    constructor(
        private readonly helperFunction: HelperFunction,
        private readonly modelService: ModelService,
        private readonly configService: ConfigService
    ) { }

    // @OnEvent('llm')
    async handelMessage(senderId: string) {
        try {
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
// console.log(this.configService.get("GOOGLE_API_KEY"))
            const messageprompt = ChatPromptTemplate.fromTemplate(`make standalone message for given to llm {message}`)
            const finalmessag = await messageprompt.pipe(model).invoke({ message: message });
            // console.log(finalmessag)

            const intentmodel  = this.intentPrompt.pipe(model);
            const res = await intentmodel.invoke({message:finalmessag});
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            console.log("intent dected" + res.content)

            

            const agent = createToolCallingAgent({
                llm: model,
                tools: tools,
                prompt: this.prompt,
            })
            
            const agentExecutor = new AgentExecutor({
                agent,
                tools
            });
//             console.log(agentExecutor)
//             console.log("-------------")
// // console.log(tools)
//             const output = StructuredOutputParser.fromZodSchema(
//                 z.array(z.object({
//                   type: z.enum(["text", "attachment"]).describe("Type of reply: 'text' for normal message, 'attachment' for image."),
//                   reply: z.string().optional().describe("Textual message to be sent to the customer (required if type is 'text')"),
//                   attachment: z.object({
//                     type: z.enum(["image"]).describe("Attachment type image if url if image type"),
//                     payload: z.object({
//                       url: z.string().describe("insert imageURL from the database")
//                     })
//                   }).optional().describe("Attachment details (required if type is 'attachment')")
//                 }))
//               );
//             const formatoutput = output.getFormatInstructions();

            const result = await agentExecutor.invoke({
                message: finalmessag,
                senderId: senderId,
                chat_history: history,
                context: this.context,
            });

            console.log(result)
            await reply.invoke({ senderId: senderId, textMessage: result.output })

            
        } catch (err) {
            console.error('Error in LLM Event Handler:', err);
            throw err
        }



    }
}

