'use client';

import { useState } from 'react';
import { MenuUploadZone, MenuExtractionProgress } from '@/app/components/menu-upload';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import type { ExtractedMenu } from '@/lib/ai/menu/extraction-schemas';

// This is a test page - in production, restaurantId would come from auth context
const TEST_RESTAURANT_ID = '698f2492-9036-48e9-8432-884c25eaf6a5'; // Lucas' Bar

type Step = 'upload' | 'extract' | 'complete';

export default function TestMenuPage() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [menuData, setMenuData] = useState<{
    id: string;
    blobUrl: string;
    thumbnailUrl: string;
    enhancedUrl: string;
  } | null>(null);
  const [extraction, setExtraction] = useState<ExtractedMenu | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = (data: typeof menuData) => {
    setMenuData(data);
    setCurrentStep('extract');
    setError(null);
  };

  const handleExtractionComplete = (extractedData: ExtractedMenu) => {
    setExtraction(extractedData);
    setCurrentStep('complete');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const reset = () => {
    setCurrentStep('upload');
    setMenuData(null);
    setExtraction(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Menu Upload & Extraction Test
          </h1>
          <p className="mt-2 text-gray-600">
            Test the AI-powered menu extraction system
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <Step 
              number={1} 
              label="Upload Menu" 
              active={currentStep === 'upload'}
              completed={currentStep !== 'upload'}
            />
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <Step 
              number={2} 
              label="Extract Information" 
              active={currentStep === 'extract'}
              completed={currentStep === 'complete'}
            />
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <Step 
              number={3} 
              label="Review Results" 
              active={currentStep === 'complete'}
              completed={false}
            />
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4"
            >
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <AnimatePresence mode="wait">
            {currentStep === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <MenuUploadZone
                  restaurantId={TEST_RESTAURANT_ID}
                  onUploadComplete={handleUploadComplete}
                  onError={handleError}
                />
              </motion.div>
            )}

            {currentStep === 'extract' && menuData && (
              <motion.div
                key="extract"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <MenuExtractionProgress
                  menuId={menuData.id}
                  restaurantId={TEST_RESTAURANT_ID}
                  thumbnailUrl={menuData.thumbnailUrl}
                  enhancedUrl={menuData.enhancedUrl}
                  onComplete={handleExtractionComplete}
                  onError={handleError}
                />
              </motion.div>
            )}

            {currentStep === 'complete' && extraction && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                  Extraction Complete!
                </h2>
                <p className="mt-2 text-gray-600">
                  Successfully extracted {extraction.items?.length || 0} menu items
                  across {extraction.sections?.length || 0} sections
                </p>

                <div className="mt-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">Summary:</h3>
                  <div className="bg-gray-50 rounded p-4 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Confidence:</span>{' '}
                      {extraction.overallConfidence}%
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Processing Time:</span>{' '}
                      {extraction.metadata?.processingTime}ms
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Method:</span>{' '}
                      {extraction.metadata?.extractionMethod}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => console.log('Full extraction:', extraction)}
                    className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
                  >
                    View Full Results (Console)
                  </button>
                  <button
                    onClick={reset}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Test Another Menu
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instructions */}
        <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <h3 className="font-semibold text-blue-900">Testing Instructions:</h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800 list-disc list-inside">
            <li>Upload a menu image (JPEG, PNG, WebP) or PDF</li>
            <li>The system will use OCR + AI to extract menu information</li>
            <li>Check the browser console for full extraction results</li>
            <li>This test page uses a hardcoded restaurant ID</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Step({ 
  number, 
  label, 
  active, 
  completed 
}: { 
  number: number; 
  label: string; 
  active: boolean; 
  completed: boolean; 
}) {
  return (
    <div className="flex items-center space-x-2">
      <div
        className={`
          flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
          ${active ? 'bg-primary text-white' : ''}
          ${completed ? 'bg-green-500 text-white' : ''}
          ${!active && !completed ? 'bg-gray-200 text-gray-600' : ''}
        `}
      >
        {completed ? <CheckCircle className="h-5 w-5" /> : number}
      </div>
      <span
        className={`
          text-sm font-medium
          ${active ? 'text-gray-900' : 'text-gray-500'}
        `}
      >
        {label}
      </span>
    </div>
  );
}