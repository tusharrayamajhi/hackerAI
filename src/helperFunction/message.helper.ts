import { Customer } from 'src/entities/Customer.entities';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CustomerMessages } from "src/entities/CustomerMessages.entities";
import { Equal, Repository } from "typeorm";
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { AiMessages } from 'src/entities/AiMessages.entities';
import { ConfigService } from '@nestjs/config';
import { AttachmentType } from 'src/entities/attachment.entities';
import { Orders } from 'src/entities/Order.entities';
import { Product, Size } from 'src/entities/Product.entities';
import { OrderItem } from 'src/entities/OrderItem.entities';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { v4 as uuid4 } from 'uuid';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';

@Injectable()
export class HelperFunction {


    constructor(
        @InjectRepository(CustomerMessages) private readonly customerMessageRepo: Repository<CustomerMessages>,
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
        @InjectRepository(AiMessages) private readonly aiMessageRepo: Repository<AiMessages>,
        @InjectRepository(Product) private readonly productRepo: Repository<Product>,
        @InjectRepository(Orders) private readonly orderRepo: Repository<Orders>,
        @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
        private readonly configService: ConfigService,
    ) { }

    getHistoryMessage() {
        return tool(async (sender: { senderId: string }) => {
            const customer = await this.customerRepo.findOneBy({ CustomerId: sender.senderId });
            if (!customer) {
                console.log("customer not found");
                console.log("stop calling llm");
                return JSON.stringify({ message: "customer not found" });
            }
            const messages = await this.customerMessageRepo.find({ where: { customer: Equal(customer.id), processed: true } });
            const aiMessages = await this.aiMessageRepo.find({ where: { customer: Equal(customer.id) } });

            // Convert messages to a common format
            const customerMessageObjects = messages.map(m => ({
                type: 'customer',
                content: m.CustomerMessage,
                createdAt: m.createdAt
            }));

            const aiMessageObjects = aiMessages.map(m => ({
                type: 'ai',
                content: m.AiMessage,
                createdAt: m.createdAt
            }));

            const allMessages = [...customerMessageObjects, ...aiMessageObjects];

            // Sort messages by creation date
            allMessages.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateA.getTime() - dateB.getTime();
            });

            

            if (allMessages.length === 0) {
                return JSON.stringify({ message: "no history message it is first conversion of customer" });
            }

            // Convert to LangChain messages
            const langchainMessages = allMessages.map(msg => {
                if (msg.type === 'customer') {
                    return new HumanMessage(msg.content);
                } else {
                    return new AIMessage(msg.content);
                }
            });

            return langchainMessages;
        }, {
            name: "get_customer_history_message",
            description: "this tools give all the history conversation of customer and you",
            schema: z.object({
                senderId: z.string().describe("sender id of customer that came from meta api")
            })
        })
    }


    getUnprocessedMessage() {

        return tool(async (sender: { senderId: string }) => {
            const customer = await this.customerRepo.findOneBy({ CustomerId: sender.senderId });
            if (!customer) {
                console.log("customer not found");
                console.log("stop calling llm");
                return JSON.stringify({ message: "customer not found" });
            }
            const messages = await this.customerMessageRepo.find({ where: { customer: Equal(customer.id), processed: false } });
            if (messages.length == 0) {
                return JSON.stringify({ message: "no unprocessed message" })
            }
            const query: any[] = []
            for (const message of messages) {
                message.processed = true;
                await this.customerMessageRepo.save(message);
                // const humanmessage = new HumanMessage(JSON.stringify(message.CustomerMessage));
                query.push(message.CustomerMessage);
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return query;
        }, {
            name: "get_customer_message",
            description: "this tools give customer message that you should process",
            schema: z.object({
                senderId: z.string().describe("sender id of customer that came from meta api")
            })
        })
    }

    getPaymentMethod() {
        return tool(async (sender) => {
            return JSON.stringify({message:"we accept 2 payment method", paymentMethods:{method1: "khalti", method2: "esewa"}})
        }, {
            name: "get_payment_method",
            description: "this tool gives you a list of method of payment",
            schema: z.object({
                senderId:z.number().describe("sender id from meta api")
            })

        })
    }

    sendTextResponseToCustomer() {
        return tool(async ({ senderId, textMessage }: {
            senderId: string,
            textMessage?: string,
        }) => {
            // console.log(senderId)
            // console.log(textMessage)
            // console.log(attachment)
            if (!senderId) {
                return JSON.stringify({ message: "empty senderId" })
            }
            const customer = await this.customerRepo.findOneBy({ CustomerId: senderId.toString() })
            if (!customer) {
                return JSON.stringify({ message: "invalid sender id" })
            }
            if (!textMessage) {
                return JSON.stringify({ message: "empty textMessage" })
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const token = this.configService.get("MESSANGER_API");
            if (!token) {
                return JSON.stringify({ message: "api token is empty " })
            }
            try {

                const response = await axios.post(`https://graph.facebook.com/v21.0/me/messages`,
                    {
                        message: {
                            text: textMessage
                        },
                        recipient: {
                            id: senderId
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const result: any = response.data
                // console.log(result)
                if (result) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    const aiMsg = this.aiMessageRepo.create({ AiMessage: textMessage, AiMessageId: response.data.message_id, attachments: [] })
                    try {

                        await this.aiMessageRepo.save({ ...aiMsg, customer: customer })
                    } catch (err) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        return JSON.stringify({ message: "failed to save data in database", err })
                    }
                }
                if (response.status) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    return JSON.stringify({ message: "successfully send message", result: result });
                }
            } catch (err) {
                console.log(err);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                return JSON.stringify({ message: err })
            }
        }, {
            name: "send_text_response_to_customer",
            description: "this tool send text response to customer bye using sender id and text message llm can send message to customer.",
            schema:z.object({
                senderId: z.string().describe("sender id of customer that came from meta api"),
                textMessage: z.string().optional().describe('text message to send a customer if you want to send a text message to customer'),
                // attachment: z.object({
                //     type: z.enum(["image", "video", "audio", "file", "fallback", "reel", "ig_reel", "template"]).describe("type of attachment"),
                //     payload: z.object({
                //         url: z.string().optional().describe("url of attachment"),
                //         // title: z.string().optional().describe("title of attachment"),
                //         // sticker_id: z.number().optional().describe("sticker id of attachment")
                //     })
                // }).optional().describe(`describe(description: string): z.ZodObject<{ type: z.ZodEnum<["image", "video", "audio", "file", "fallback", "reel", "ig_reel", "template"]>; payload: z.ZodObject<{ url: z.ZodOptional<z.ZodString>; title: z.ZodOptional<z.ZodString>; sticker_id: z.ZodOptional<...>; }, "strip", z.ZodTypeAny, { ...; }, { ...; }>; }, "strip", z.ZodTypeAny, { ...; }, { ...; }>`),
            })
        })
    }

    sendAttachmentResponseToCustomer() {
        return tool(async ({ senderId, attachment }: {
            senderId: number,
            attachment: {
                type: AttachmentType,
                payload: {
                    url: string
                }
            },
        }) => {
            if (!senderId) {
                return JSON.stringify({ message: "empty senderId" })
            }
            if (!attachment) {
                return JSON.stringify({ message: "empty attachment" })
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const token = this.configService.get("MESSANGER_API");
            if (!token) {
                return JSON.stringify({ message: "api token is empty " })
            }
            const response = await axios.post(`https://graph.facebook.com/v21.0/me/messages`,
                {
                    message: {
                        attachment: {
                            type: attachment.type,
                            payload: {
                                url: attachment.payload.url
                            }
                        }
                    },
                    recipient: {
                        id: senderId
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            // console.log(await response.data)
            // if(response.)
            return JSON.stringify(await response.data);
        }, {
            name: "send_attachment_response_to_customer",
            description: "this tool send attachment response to customer like image, video, audio, file, fallback, reel, ig_reel, template etc",
            schema: z.object({
                senderId: z.number().describe("sender id of customer that came from meta api"),
                attachment: z.object({
                    type: z.enum(["image", "video", "audio", "file", "fallback", "reel", "ig_reel", "template"]).describe("type of attachment that you can send to customer"),
                    payload: z.object({
                        url: z.string().optional().describe("url of attachment")
                    })
                })
            })
        })
    }

    getOrderDetails() {
        return tool(async ({ senderId }: { senderId: number }) => {
            const customer = await this.customerRepo.findOneBy({ CustomerId: senderId.toString() })
            if (!customer) {
                return JSON.stringify({ message: "customer not found sender id not valid" })
            }
            const orders = await this.orderRepo.findOne({ where: { customer: customer, status: "pending" } })
            if (!orders) {
                return JSON.stringify({ message: "no order found" })
            }
            return JSON.stringify(orders)

        }, {
            name: "get_Customer_Order_detail",
            description: "this tools give you the order details by the customer and order item",
            schema: z.object({
                senderId: z.number().describe("sender id of customer that came from meta api")
            })
        })
    }

    getSimilarProduct() {
        return tool(async ({ name }: { name: string }) => {
            const product = await this.productRepo.findOneBy({ productName: name })
            if (!product) {
                return JSON.stringify({ message: "product not found" })
            }
            return JSON.stringify(product);
        }, {
            name: "get_product_details",
            description: "this tool give the similar t-shit f",
            schema: z.object({
                name: z.string().describe("name of product")
            })
        })
    }

    saveOrder() {
        return tool(async (data: { senderId: string; items: { productId: string; quantity: number }[] }) => {
            const customer = await this.customerRepo.findOne({ where: { CustomerId: data.senderId } });
            if (!customer) throw new Error("Customer not found");

            // Create Order

            let totalAmount = 0;
            const orderItems: OrderItem[] = [];

            // Create Order Items
            for (const item of data.items) {
                const product = await this.productRepo.findOne({ where: { id: item.productId } });
                if (!product) return JSON.stringify({ message: `Product with ID ${item.productId} not found` });

                if (product.stock < item.quantity) return JSON.stringify({ message: `Insufficient stock for product ${product.productName}` });

                const orderItem = this.orderItemRepo.create({
                    product: product,
                    quantity: item.quantity,
                    price: product.price,
                });

                orderItems.push(orderItem);
                totalAmount += product.price * item.quantity;
            }

            const order = this.orderRepo.create({ customer: customer, status: "pending", total_amount: totalAmount });
            const result = await this.orderRepo.save(order);
            if (!result) {
                return JSON.stringify({ message: "save successfully" });
            }
            // Save Order Items
            // await this.orderRepo.save(orderItems);

            // Update Order Total
            // order.total_amount = totalAmount;
            // await this.orderRepo.save(order);

            return JSON.stringify({ message: "Order saved successfully", orderId: order.id });
        }, {
            name: "save_order_to_database",
            description: "This tool saves a customer's order",
            schema: z.object({
                senderId: z.string().describe("Sender ID of the customer from Meta API"),
                items: z.array(
                    z.object({
                        productId: z.string().describe("ID of the product"),
                        quantity: z.number().min(1).describe("Quantity of product (must be 1 or greater)"),
                    })
                ).min(1).describe("Array of order items (must contain at least one item)")
            })
        })
    }

    getAllProduct() {
        return tool(async (filter:{size:Size,color:string}) => {
            console.log("hello")
            const product = await this.productRepo.find({where:{size:filter.size,color:filter.color}});
            console.log(product)
            return JSON.stringify(product)
        }, {
            name: "get_t_shirts_by_size_and_color",
            description: "Fetches a list of t-shirts based on provided size and color.",
            schema:z.object({
                size:z.string().describe("T-shirt size: XS (Extra Small), S (Small), M (Medium), L (Large), XL (Extra Large), XXL (Extra Extra Large)"),
                color:z.string().describe("Color of the T-shirt to filter by")
            })
        })
    }


    generatePaymentLink() {
        return tool(async (sender: { senderId: string }) => {
            const customer = await this.customerRepo.findOneBy({ CustomerId: sender.senderId })
            if (!customer) {
                return JSON.stringify({ message: "customer not found" })
            }
            // const order = await this.orderRepo.findOne({ where: { customer: customer, status: "pending" } })
            // if (!order) {
            //     return JSON.stringify({ message: "no order found" })
            // }

            // eSewa configuration
            const secretKey = '8gBm/:&EnhH.1/q'; // UAT Secret Key
            const baseUrl = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

            // Prepare payment data
            const transactionUuid = uuid4();
            const amount = 200; // You can make this dynamic based on order

            const formData = {
                amount: amount.toString(),
                tax_amount: '0',
                total_amount: amount.toString(),
                transaction_uuid: transactionUuid,
                product_code: 'EPAYTEST',
                product_service_charge: '0',
                product_delivery_charge: '0',
                success_url: 'http://localhost:3000/success',
                failure_url: 'http://localhost:3000/failure',
                signed_field_names: 'total_amount,transaction_uuid,product_code',
            };

            // Generate HMAC SHA256 signature
            const dataToSign = `total_amount=${formData.total_amount},transaction_uuid=${formData.transaction_uuid},product_code=${formData.product_code}`;
            const hash = CryptoJS.HmacSHA256(dataToSign, secretKey);
            const signature = CryptoJS.enc.Base64.stringify(hash);

            // Complete payload with signature
            const payload = {
                ...formData,
                signature: signature
            };

            try {
                const urlEncodedData = new URLSearchParams(payload).toString();

                // Send POST request to eSewa
                const response = await axios.post(baseUrl, urlEncodedData, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                // console.log(response.request.res.responseUrl)
                // Return successful response
                return JSON.stringify({
                    // success: true,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    paymentUrl: response.request.res.responseUrl,
                    // transactionUuid: transactionUuid,
                    message: 'Payment request successfully sent to eSewa'
                });
                

            } catch (error) {
                throw new Error(`eSewa Payment Error: ${error.message}`);
            }




        }, {
            name: "generate_esewa_payment_link",
            description: "if customer want to pay through esewa use this tool to generate a payment link and send to customer",
            schema: z.object({
                senderId: z.string().describe("sender id of customer that came from meta api")
            })
        })
    }

    getExampleConversation() { }

}
