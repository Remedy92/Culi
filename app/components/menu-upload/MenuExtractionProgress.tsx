'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@radix-ui/react-progress';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Sparkles,
  ListChecks,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExtractedMenu } from '@/lib/ai/menu/extraction-schemas';
import type { ProgressUpdate } from '@/lib/utils/progress-tracker';

interface MenuExtractionProgressProps {
  menuId: string;
  restaurantId: string;
  thumbnailUrl: string;
  enhancedUrl?: string;
  onComplete: (extraction: ExtractedMenu) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface Milestone {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  detail?: string;
}

export function MenuExtractionProgress({
  menuId,
  restaurantId,
  thumbnailUrl,
  enhancedUrl,
  onComplete,
  onError,
  className
}: MenuExtractionProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing extraction...');
  const [itemsFound, setItemsFound] = useState(0);
  const [sectionsFound, setSectionsFound] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 'ocr', label: 'Text Recognition (OCR)', status: 'pending' },
    { id: 'ai', label: 'AI Analysis', status: 'pending' },
    { id: 'merge', label: 'Merging Results', status: 'pending' },
    { id: 'validation', label: 'Validation', status: 'pending' }
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [extractionTime, setExtractionTime] = useState(0);
  const announcerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isExtractingRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate extraction requests
    if (isExtractingRef.current) {
      console.log('Extraction already in progress, skipping duplicate request');
      return;
    }
    
    isExtractingRef.current = true;
    startExtraction();
    
    // Start timer
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setExtractionTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    
    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Abort any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isExtractingRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId]);

  const startExtraction = async () => {
    try {
      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/menu/extract-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuId,
          restaurantId,
          thumbnailUrl,
          enhancedUrl
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Extraction failed');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      await handleStreamingResponse(response.body);
    } catch (error) {
      // Only show error if not aborted
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Extraction aborted');
        return;
      }
      
      console.error('Extraction error:', error);
      setErrors([error instanceof Error ? error.message : 'Extraction failed']);
      onError?.(error instanceof Error ? error.message : 'Extraction failed');
    } finally {
      isExtractingRef.current = false;
    }
  };

  const handleStreamingResponse = async (body: ReadableStream) => {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete events
        const lines = buffer.split('\n');
        
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleProgressUpdate(data);
            } catch (e) {
              console.error('Failed to parse event:', e, line);
            }
          }
        }
        
        // Keep the last line in buffer if it's incomplete
        buffer = lines[lines.length - 1];
      }
    } catch (error) {
      console.error('Streaming error:', error);
      onError?.('Failed to process streaming response');
    }
  };

  const handleProgressUpdate = (data: ProgressUpdate & { 
    extraction?: ExtractedMenu;
    stats?: { confidence: number; lines: number; textLength: number };
    metrics?: { itemsExtracted: number; confidence: number; processingTime: number };
    error?: string;
  }) => {
    // Update progress
    if (data.progress >= 0) {
      setProgress(data.progress);
    }
    
    // Update message
    if (data.message) {
      setCurrentStep(data.message);
      announce(data.message);
    }
    
    // Update milestones based on stage
    switch (data.stage) {
      case 'ocr_start':
      case 'ocr_processing':
        updateMilestone('ocr', 'active', data.message);
        break;
      case 'ocr_complete':
        updateMilestone('ocr', 'completed', `${data.stats?.confidence || 0}% confidence`);
        if (data.stats) {
          setSectionsFound(1); // OCR found text
        }
        break;
      case 'ai_start':
      case 'ai_processing':
        updateMilestone('ai', 'active', data.message);
        break;
      case 'ai_complete':
      case 'ai_fallback':
        updateMilestone('ai', 'completed');
        break;
      case 'merge_start':
      case 'merge_processing':
        updateMilestone('merge', 'active', data.message);
        break;
      case 'validation':
      case 'save_start':
      case 'items_saved':
        updateMilestone('validation', 'active', data.message);
        break;
      case 'complete':
        updateMilestone('merge', 'completed');
        updateMilestone('validation', 'completed');
        if (data.extraction) {
          handleExtractionComplete(data.extraction);
        }
        if (data.metrics) {
          setItemsFound(data.metrics.itemsExtracted || 0);
        }
        break;
      case 'error':
        if (data.error) {
          setErrors([data.error]);
          onError?.(data.error);
        }
        break;
      case 'warning':
      case 'offer_alternative':
      case 'timeout_warning':
        setWarningMessage(data.message);
        break;
    }
  };

  const handleExtractionComplete = (extraction: ExtractedMenu) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setProgress(100);
    setCurrentStep('Extraction complete!');
    announce('Menu extraction completed successfully');
    
    // Count total items
    const totalItems = extraction.sections.reduce(
      (sum, section) => sum + section.items.length, 
      0
    );
    setItemsFound(totalItems);
    setSectionsFound(extraction.sections.length);
    
    onComplete(extraction);
  };

  const updateMilestone = (
    id: string, 
    status: Milestone['status'], 
    detail?: string
  ) => {
    setMilestones(prev => prev.map(m => 
      m.id === id ? { ...m, status, detail } : m
    ));
  };

  const announce = (message: string) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = message;
    }
  };

  const getMilestoneIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'active':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Progress header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Extracting Menu Information
        </h3>
        <p className="mt-1 text-sm text-gray-600">{currentStep}</p>
        {extractionTime > 0 && (
          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{extractionTime}s</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <Progress
          value={progress}
          className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
          aria-label={`Extraction progress: ${progress}%`}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </Progress>
        <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
          <span>{progress}% complete</span>
          <span>{itemsFound} items found</span>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-3" role="list" aria-label="Extraction steps">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            role="listitem"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-start space-x-3 rounded-lg p-3',
              milestone.status === 'active' && 'bg-primary/5',
              milestone.status === 'error' && 'bg-red-50'
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getMilestoneIcon(milestone.status)}
            </div>
            <div className="flex-1">
              <p className={cn(
                'font-medium',
                milestone.status === 'completed' && 'text-green-700',
                milestone.status === 'error' && 'text-red-700'
              )}>
                {milestone.label}
              </p>
              {milestone.detail && (
                <p className="text-sm text-gray-600">{milestone.detail}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Statistics */}
      <AnimatePresence>
        {(sectionsFound > 0 || itemsFound > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <ListChecks className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-2xl font-semibold">{sectionsFound}</p>
              <p className="text-sm text-gray-600">Sections</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-2xl font-semibold">{itemsFound}</p>
              <p className="text-sm text-gray-600">Menu Items</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warnings */}
      <AnimatePresence>
        {warningMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
            role="alert"
          >
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800">{warningMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-lg border border-red-200 bg-red-50 p-4"
            role="alert"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900">
                  Extraction failed
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-red-700">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen reader announcements */}
      <div
        ref={announcerRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </div>
  );
}