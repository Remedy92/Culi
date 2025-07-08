import { generateText, streamText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';

// Create gateway instance for optional custom API key
const gateway = process.env.AI_GATEWAY_API_KEY
  ? createGateway({
      apiKey: process.env.AI_GATEWAY_API_KEY,
      baseURL: 'https://ai-gateway.vercel.sh/v1/ai',
    })
  : null;

export async function POST(req: Request) {
  try {
    const { prompt, model = 'openai/gpt-4', stream = false } = await req.json();

    // Available models: 'xai/grok-3', 'openai/gpt-4', 'openai/gpt-3.5-turbo', etc.
    const modelToUse = gateway ? gateway(model) : model;

    if (stream) {
      // Stream response for real-time output
      const result = await streamText({
        model: modelToUse,
        prompt,
      });

      return result.toDataStreamResponse();
    } else {
      // Generate complete text response
      const result = await generateText({
        model: modelToUse,
        prompt,
      });

      return Response.json({
        text: result.text,
        model: model,
        usage: result.usage,
      });
    }
  } catch (error) {
    console.error('AI API Error:', error);
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

// Example usage from client:
// const response = await fetch('/api/ai', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     prompt: 'Tell me about quantum computing',
//     model: 'xai/grok-3', // or 'openai/gpt-4'
//     stream: true
//   })
// });