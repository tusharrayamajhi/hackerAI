![system_architecture drawio](https://github.com/user-attachments/assets/61730f3e-cefa-4a44-826f-61effbb58054)# MiddelMan
🧠🛒 AI Sales Agent for T-Shirt Selling via Message (Natural Language Processing)

This is an AI-powered chatbot that helps users buy t-shirts directly through Facebook Messenger. It uses Gemini LLM with custom prompt engineering to understand user messages and guide them through the shopping process—from browsing products to placing an order.

🚀 Features

Messenger  – Talk to users via Facebook Messenger.

Smart AI – Uses Gemini LLM + prompt engineering to understand and reply to user queries.

Product Catalog – Displays t-shirt info like images, size, price, and description.

Interactive Shopping – Users can select size, color, and confirm orders within the chat.

Smooth Checkout – Supports payment confirmation (e.g., esewa).



🛠 User Interaction Flow

1. Start Conversation:
User sends a message like: “Hi, I want to buy a t-shirt.”

2. AI Shows Options:
AI: Sure! Here are the t-shirts available:
- Classic White T-shirt – $20
- Graphic Black T-shirt – $25

3. User Picks Product:
User: I want the Black T-shirt.
AI: What size would you like? S, M, L, XL.

4. Confirm & Pay:
User: M
AI: Great! Your total is $25. Please proceed to payment.

5. Order Placed
AI: Thank you! Your order is confirmed and will be shipped soon. 


🧰 Tech Stack

Component	                     Description
Messenger API            	Facebook Messenger for chatbot UI
Next.js                 	Frontend framework (responsive UI)
JavaScript	                Main language (frontend & backend)
Gemini LLM	                AI brain for conversations
Langchain	                Bridges LLM with logic
MySQL	                   Stores product and order data


⚙️ Requirements

- JavaScript
- Next.js
- MySQL
- Facebook Messenger API
- Gemini LLM access
- Langchain

🛠 Instructions to run the app
1. Clone the repo 
git clone https://github.com/tusharrayamajhi/hackerAI
cd HackerAi

2. Install dependencies
npm install

setup nagrok and public the localhost url to internet

3. Configure Facebook Messenger API
- Create a access token for your Facebook App from the Meta Developer Portal.
- Set up the Messenger platform.
- Generate and use your Page Access Token.
- Set your webhook using ngrok or deployed URL.
- use verify token to verify the webhook.
- subscribe for the message events.



4. Set environment variables Create a .env file and add:
    PAGE_ACCESS_TOKEN=your_fb_page_token
    VERIFY_TOKEN=your_verify_token
    GEMINI_API_KEY=your_gemini_api_key
    mysqlDatabaseSetup
    email id and pass key for sending email
    esewa redirect url

    

5. Run the project
npm run start:dev





🔮 Future Plans

1. Add more payment options (e.g., PayPal)
2. Multi-language chatbot support
3. Expand to Instagram, Telegram, and more
4. Improve AI responses with better prompts
5. user can simply upload image and do inquery

🙏 Acknowledgements
- Facebook Messenger Platform
- Meta for Developers
- Next.js
- MySQL
- Gemini LLM
- NestJS
- Langchain
- Gemini LLM by Google
- Prompt Engineering Community

Team Name:
- Tushar Rayamajhi:BackEnd/AI 
- Manish Ghimire:UI
- Asim Saru: Prompt Engineering 


frontend github link :- https://github.com/TheGoodSpirit/Joopa-Digital/tree/main/HimalAi