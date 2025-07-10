import { generateText, streamText } from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { createOpenAI } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== Gateway Test Endpoint ===');
  console.log('AI_GATEWAY_API_KEY exists:', !!process.env.AI_GATEWAY_API_KEY);
  console.log('AI_GATEWAY_API_KEY length:', process.env.AI_GATEWAY_API_KEY?.length || 0);
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
  
  const tests = [];
  
  // Test 1: Direct OpenAI
  try {
    console.log('\nTest 1: Direct OpenAI...');
    const openai = createOpenAI();
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: 'Say "Direct OpenAI works!" in exactly 3 words.',
      maxTokens: 10,
    });
    tests.push({ 
      test: 'Direct OpenAI', 
      success: true, 
      text: result.text 
    });
    console.log('✓ Direct OpenAI success:', result.text);
  } catch (error) {
    console.error('✗ Direct OpenAI failed:', error);
    tests.push({ 
      test: 'Direct OpenAI', 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    });
  }
  
  // Test 2: Gateway with openai/ prefix
  if (process.env.AI_GATEWAY_API_KEY) {
    try {
      console.log('\nTest 2: Gateway with openai/ prefix...');
      const result = await generateText({
        model: gateway('openai/gpt-4o-mini'),
        prompt: 'Say "Gateway works!" in exactly 2 words.',
        maxTokens: 10,
      });
      tests.push({ 
        test: 'Gateway (openai/gpt-4o-mini)', 
        success: true, 
        text: result.text 
      });
      console.log('✓ Gateway with prefix success:', result.text);
    } catch (error) {
      console.error('✗ Gateway with prefix failed:', error);
      tests.push({ 
        test: 'Gateway (openai/gpt-4o-mini)', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
    }
    
    // Test 3: Gateway without prefix
    try {
      console.log('\nTest 3: Gateway without prefix...');
      const result = await generateText({
        model: gateway('gpt-4o-mini'),
        prompt: 'Say "Gateway works!" in exactly 2 words.',
        maxTokens: 10,
      });
      tests.push({ 
        test: 'Gateway (gpt-4o-mini)', 
        success: true, 
        text: result.text 
      });
      console.log('✓ Gateway without prefix success:', result.text);
    } catch (error) {
      console.error('✗ Gateway without prefix failed:', error);
      tests.push({ 
        test: 'Gateway (gpt-4o-mini)', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
    }
  } else {
    tests.push({ 
      test: 'Gateway tests', 
      success: false, 
      error: 'AI_GATEWAY_API_KEY not set' 
    });
  }
  
  // Test 4: Gateway with image using generateText
  if (process.env.AI_GATEWAY_API_KEY) {
    try {
      console.log('\nTest 4: Gateway with image (generateText)...');
      const testImageUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
      const result = await generateText({
        model: gateway('openai/gpt-4o-mini'),
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'What do you see in this image? Answer in 5 words or less.' },
            { type: 'image', image: testImageUrl }
          ]
        }],
        maxTokens: 20,
      });
      tests.push({ 
        test: 'Gateway with image (generateText)', 
        success: true, 
        text: result.text 
      });
      console.log('✓ Gateway with image success:', result.text);
    } catch (error) {
      console.error('✗ Gateway with image failed:', error);
      tests.push({ 
        test: 'Gateway with image (generateText)', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
    }
    
    // Test 5: Gateway with image using streamText (with timeout)
    try {
      console.log('\nTest 5: Gateway with image (streamText)...');
      const testImageUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('StreamText timeout after 10 seconds')), 10000)
      );
      
      const streamPromise = streamText({
        model: gateway('openai/gpt-4o-mini'),
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'What do you see? Answer in 5 words.' },
            { type: 'image', image: testImageUrl }
          ]
        }],
        maxOutputTokens: 20,
      });
      
      const result = await Promise.race([streamPromise, timeoutPromise]) as Awaited<typeof streamPromise>;
      const text = await result.text;
      
      tests.push({ 
        test: 'Gateway with image (streamText)', 
        success: true, 
        text: text 
      });
      console.log('✓ Gateway streamText with image success:', text);
    } catch (error) {
      console.error('✗ Gateway streamText with image failed:', error);
      tests.push({ 
        test: 'Gateway with image (streamText)', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        errorName: error instanceof Error ? error.name : 'Unknown',
        isTimeout: error instanceof Error && error.message.includes('timeout')
      });
    }
  }
  
  const allSuccess = tests.every(t => t.success);
  
  return NextResponse.json({
    success: allSuccess,
    tests,
    environment: {
      gatewayKeySet: !!process.env.AI_GATEWAY_API_KEY,
      gatewayKeyLength: process.env.AI_GATEWAY_API_KEY?.length || 0,
      openaiKeySet: !!process.env.OPENAI_API_KEY,
    }
  }, { 
    status: allSuccess ? 200 : 500 
  });
}