import { httpRouter } from "convex/server";
import { paymentWebhook } from "./subscriptions";
import { httpAction } from "./_generated/server";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

// Simple in-memory rate limiting (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

function validateMessages(messages: any[]): boolean {
  if (!Array.isArray(messages)) return false;
  if (messages.length === 0) return false;
  if (messages.length > 50) return false; // Prevent spam
  
  for (const message of messages) {
    if (!message.role || !['user', 'assistant', 'system'].includes(message.role)) return false;
    if (!message.content || typeof message.content !== 'string') return false;
    if (message.content.length > 10000) return false; // Prevent extremely long messages
    
    // Validate attachments if present
    if (message.experimental_attachments) {
      if (!Array.isArray(message.experimental_attachments)) return false;
      if (message.experimental_attachments.length > 5) return false; // Max 5 images
      
      for (const attachment of message.experimental_attachments) {
        if (!attachment.contentType || !attachment.contentType.startsWith('image/')) return false;
        if (!attachment.url || !attachment.url.startsWith('data:image/')) return false;
        // Check base64 data size (rough estimate: 1.33x original size)
        if (attachment.url.length > 15 * 1024 * 1024) return false; // ~10MB original image
      }
    }
  }
  
  return true;
}

export const chat = httpAction(async (ctx, req) => {
  try {
    // Validate API key is present
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
      return new Response("Service temporarily unavailable", { status: 503 });
    }

    // Get client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(',')[0] : "unknown";
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return new Response("Rate limit exceeded. Please try again later.", { 
        status: 429,
        headers: {
          "Retry-After": "60",
          "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
        }
      });
    }

    // Extract and validate the request body
    const body = await req.json();
    const { messages } = body;

    // Validate messages
    if (!validateMessages(messages)) {
      return new Response("Invalid request format", { status: 400 });
    }

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages,
      async onFinish({ text }) {
        // implement your own logic here, e.g. for storing messages
        // or recording token usage
        console.log(text);
      },
    });

    // Respond with the stream
    return result.toDataStreamResponse({
      headers: {
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        Vary: "origin",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { 
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
      }
    });
  }
});

const http = httpRouter();

http.route({
  path: "/api/chat",
  method: "POST",
  handler: chat,
});

http.route({
  path: "/api/chat",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

http.route({
  path: "/api/auth/webhook",
  method: "POST",
  handler: httpAction(async (_, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

http.route({
  path: "/payments/webhook",
  method: "POST",
  handler: paymentWebhook,
});

// Log that routes are configured
console.log("HTTP routes configured");

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
