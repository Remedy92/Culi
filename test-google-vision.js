#!/usr/bin/env node

/**
 * Test script for Google Vision OCR integration
 * This demonstrates how to test the OCR functionality locally
 * 
 * Usage:
 * 1. Set up Google Cloud credentials:
 *    export GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
 * 
 * 2. Enable Google Vision in config:
 *    Edit lib/config/extraction.ts and set USE_GOOGLE_VISION: true
 * 
 * 3. Run this script:
 *    node test-google-vision.js <image-url>
 * 
 * Example:
 *    node test-google-vision.js https://example.com/menu.jpg
 */

import { ImageAnnotatorClient } from '@google-cloud/vision';

async function testGoogleVision(imageUrl) {
  console.log('Testing Google Vision OCR with:', imageUrl);
  
  try {
    // Initialize the client
    const client = new ImageAnnotatorClient({
      credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? 
        (() => {
          const creds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
          // Fix escaped newlines in private key
          if (creds.private_key) {
            creds.private_key = creds.private_key.replace(/\\n/g, '\n');
          }
          return creds;
        })() : undefined
    });

    // Prepare the request
    const request = {
      image: {
        source: {
          imageUri: imageUrl
        }
      },
      features: [{
        type: 'DOCUMENT_TEXT_DETECTION',
        maxResults: 10
      }],
      imageContext: {
        languageHints: ['nl', 'en', 'fr', 'de', 'es', 'it']
      }
    };

    console.log('Sending request to Google Vision API...');
    const startTime = Date.now();
    
    // Perform text detection
    const [result] = await client.annotateImage(request);
    const fullTextAnnotation = result.fullTextAnnotation;
    
    const duration = Date.now() - startTime;
    console.log(`\nOCR completed in ${duration}ms`);
    
    if (!fullTextAnnotation) {
      console.log('No text detected in image');
      return;
    }

    // Display results
    console.log('\n--- DETECTED TEXT ---');
    console.log(fullTextAnnotation.text);
    
    // Display language detection
    if (fullTextAnnotation.pages?.[0]?.property?.detectedLanguages) {
      console.log('\n--- DETECTED LANGUAGES ---');
      fullTextAnnotation.pages[0].property.detectedLanguages.forEach(lang => {
        console.log(`${lang.languageCode}: ${(lang.confidence * 100).toFixed(1)}% confidence`);
      });
    }
    
    // Display confidence scores
    let totalConfidence = 0;
    let symbolCount = 0;
    
    fullTextAnnotation.pages?.forEach(page => {
      page.blocks?.forEach(block => {
        block.paragraphs?.forEach(paragraph => {
          paragraph.words?.forEach(word => {
            word.symbols?.forEach(symbol => {
              if (symbol.confidence !== undefined) {
                totalConfidence += symbol.confidence;
                symbolCount++;
              }
            });
          });
        });
      });
    });
    
    if (symbolCount > 0) {
      const avgConfidence = (totalConfidence / symbolCount) * 100;
      console.log(`\n--- OVERALL CONFIDENCE ---`);
      console.log(`${avgConfidence.toFixed(1)}%`);
    }
    
    console.log('\n--- STATISTICS ---');
    console.log(`Pages: ${fullTextAnnotation.pages?.length || 0}`);
    console.log(`Blocks: ${fullTextAnnotation.pages?.[0]?.blocks?.length || 0}`);
    console.log(`Text length: ${fullTextAnnotation.text?.length || 0} characters`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('credentials')) {
      console.log('\nMake sure to set GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable');
      console.log('Example: export GOOGLE_APPLICATION_CREDENTIALS_JSON=\'{"type":"service_account",...}\'');
    }
  }
}

// Get image URL from command line argument
const imageUrl = process.argv[2];

if (!imageUrl) {
  console.log('Usage: node test-google-vision.js <image-url>');
  console.log('Example: node test-google-vision.js https://example.com/menu.jpg');
  process.exit(1);
}

testGoogleVision(imageUrl);