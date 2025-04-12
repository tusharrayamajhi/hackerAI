// sender
 export interface Sender {
    id: string;
    user_ref?: string;
  }
  
  // recipient
  export interface Recipient {
    id: string;
  }
  
  // message.quick_reply
  export interface QuickReply {
    payload: string;
  }
  
  // message.reply_to
   export interface ReplyTo {
    mid: string;
  }
  
  // message.attachments.payload
   export interface AttachmentPayload {
    url?: string;
    title?: string;
    sticker_id?: number;
    reel_video_id?: number;
    product?: {
        elements: ProductElement[];
    }
  }
  
  // message.attachments.payload.product.elements
  export interface ProductElement {
    id: string;
    retailer_id: string;
    image_url: string;
    title: string;
    subtitle: string;
  }
  
  // message.attachments
  export interface Attachment {
    type: "image" | "video" | "audio" | "file" | "fallback" | "reel" | "ig_reel" | "template";
    payload: AttachmentPayload;
  }
  
  // message.referral.product
  export interface ReferralProduct {
    id: string;
  }
  
  // message.referral.ads_context_data
  export interface AdsContextData {
    ad_title: string;
    photo_url?: string;
    video_url?: string;
    post_id: string;
    product_id?: string;
    flow_id?: string;
  }
  
  // message.referral
  export interface Referral {
    product?: ReferralProduct;
    source?: "ADS";
    type?: "OPEN_THREAD";
    ref?: string;
    ad_id?: string;
    ads_context_data?: AdsContextData;
  }
  
  // message.commands
   export interface Command {
    name: string;
  }
  
  // message
  export interface Message {
    mid: string;
    text?: string;
    quick_reply?: QuickReply;
    reply_to?: ReplyTo;
    attachments?: Attachment[];
    referral?: Referral;
    commands?: Command[];
  }
  
  // Messaging Event
  export interface MessagingEvent {
    delivery?: any; // Make optional
    sender: Sender;
    recipient: Recipient;
    timestamp: number;
    message?: Message; // Make optional
    echo?: any;      // For message echoes
    message_edits?: any; // For message edits
    reaction?: any;  // For message reactions
    read?: any;  // For message reads
    messaging_account_linking?: any;
    messaging_feedback?: any;
    messaging_game_plays?: any;
    messaging_handovers?: any;
    messaging_optins?: any;
    messaging_policy_enforcement?: any;
    postback?: any;
    referral?: any;
    messaging_seen?: any;
    response_feedback?: any;
    send_cart?: any;
    standby?: any;
  }
  
  // Webhook Entry
  export interface Entry {
    id: string;
    time: number;
    messaging: MessagingEvent[];
  }
  
  // Top-level Webhook Event (export added)
  export interface WebhookEvent {
    object: "page";
    entry: Entry[];
  }
