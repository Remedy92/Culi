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
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  MenuExtractionParser, 
  type ExtractionUpdate 
} from '@/lib/ai/menu/extraction-parser';
import type { ExtractedMenu } from '@/lib/ai/menu/extraction-schemas';

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
    { id: 'validate', label: 'Validation', status: 'pending' }
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const announcerRef = useRef<HTMLDivElement>(null);
  const parserRef = useRef<MenuExtractionParser | null>(null);

  useEffect(() => {
    startExtraction();
    return () => {
      // Cleanup if component unmounts
      if (parserRef.current) {
        parserRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId]);

  const startExtraction = async () => {
    try {
      updateMilestone('ocr', 'active', 'Processing image with OCR...');
      
      const response = await fetch('/api/menu/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuId,
          restaurantId,
          thumbnailUrl,
          enhancedUrl
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Extraction failed');
      }

      const data = await response.json();
      
      if (data.extraction) {
        // Non-streaming response
        handleExtractionComplete(data.extraction);
      } else if (response.body) {
        // Streaming response
        handleStreamingResponse(response.body);
      }
    } catch (error) {
      console.error('Extraction error:', error);
      updateMilestone('ocr', 'error', 'Failed to process');
      onError?.(error instanceof Error ? error.message : 'Extraction failed');
    }
  };

  const handleStreamingResponse = async (body: ReadableStream) => {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    
    parserRef.current = new MenuExtractionParser(
      handleExtractionUpdate,
      handleExtractionComplete
    );

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        parserRef.current.processChunk(chunk);
      }
      
      parserRef.current.flush();
    } catch (error) {
      console.error('Streaming error:', error);
      onError?.('Failed to process streaming response');
    }
  };

  const handleExtractionUpdate = (update: ExtractionUpdate) => {
    switch (update.type) {
      case 'thinking':
        setCurrentStep(update.message || 'Processing...');
        break;
        
      case 'section_found':
        setSectionsFound(prev => prev + 1);
        updateMilestone('ai', 'active', `Found section: ${update.content?.name}`);
        announce(`Found menu section: ${update.content?.name}`);
        break;
        
      case 'item_found':
        setItemsFound(prev => prev + 1);
        if (itemsFound === 0) {
          updateMilestone('ai', 'active', 'Extracting menu items...');
        }
        announce(`Found item: ${update.content?.name}`);
        break;
        
      case 'progress':
        setProgress(update.progress || 0);
        break;
        
      case 'error':
        setErrors(prev => [...prev, update.message || 'Unknown error']);
        break;
    }
  };

  const handleExtractionComplete = (extraction: ExtractedMenu) => {
    updateMilestone('ocr', 'completed');
    updateMilestone('ai', 'completed');
    updateMilestone('merge', 'completed');
    updateMilestone('validate', 'completed');
    
    setProgress(100);
    setCurrentStep('Extraction complete!');
    announce('Menu extraction completed successfully');
    
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
                  Some items need attention
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