'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Loader2,
  Sparkles as SparklesIcon,
  Brain,
  FileText,
  Merge,
  Shield,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CuliLogoLoading } from '@/app/components/CuliCurveLogo';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { Sparkles } from '@/components/ui/sparkles';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';
import type { ExtractedMenu } from '@/lib/ai/menu/extraction-schemas';
import type { ProgressUpdate } from '@/lib/utils/progress-tracker';

interface AIExtractionProgressProps {
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
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed' | 'error';
  detail?: string;
}

export function AIExtractionProgress({
  menuId,
  restaurantId,
  thumbnailUrl,
  enhancedUrl,
  onComplete,
  onError,
  className
}: AIExtractionProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Initializing AI systems...');
  const [showSparkles, setShowSparkles] = useState(false);
  const [itemsFound, setItemsFound] = useState(0);
  const [sectionsFound, setSectionsFound] = useState(0);
  const [extractionTime, setExtractionTime] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { 
      id: 'ocr', 
      label: 'Reading Menu Text', 
      icon: <FileText className="h-5 w-5" />,
      status: 'pending' 
    },
    { 
      id: 'ai', 
      label: 'AI Understanding', 
      icon: <Brain className="h-5 w-5" />,
      status: 'pending' 
    },
    { 
      id: 'merge', 
      label: 'Combining Insights', 
      icon: <Merge className="h-5 w-5" />,
      status: 'pending' 
    },
    { 
      id: 'validation', 
      label: 'Quality Check', 
      icon: <Shield className="h-5 w-5" />,
      status: 'pending' 
    }
  ]);
  
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isExtractingRef = useRef(false);

  useEffect(() => {
    if (isExtractingRef.current) return;
    
    isExtractingRef.current = true;
    startExtraction();
    
    // Start timer
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setExtractionTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      isExtractingRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId]);

  const startExtraction = async () => {
    try {
      abortControllerRef.current = new AbortController();
      setShowSparkles(true);
      
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
      if (error instanceof Error && error.name === 'AbortError') return;
      
      console.error('Extraction error:', error);
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
        const lines = buffer.split('\n');
        
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleProgressUpdate(data);
            } catch (e) {
              console.error('Failed to parse event:', e);
            }
          }
        }
        
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
    if (data.progress >= 0) {
      setProgress(data.progress);
    }
    
    if (data.message) {
      setCurrentMessage(data.message);
    }
    
    // Update milestones
    switch (data.stage) {
      case 'ocr_start':
      case 'ocr_processing':
        updateMilestone('ocr', 'active');
        break;
      case 'ocr_complete':
        updateMilestone('ocr', 'completed');
        break;
      case 'ai_start':
      case 'ai_processing':
        updateMilestone('ai', 'active');
        break;
      case 'ai_complete':
        updateMilestone('ai', 'completed');
        break;
      case 'merge_start':
        updateMilestone('merge', 'active');
        break;
      case 'validation':
      case 'save_start':
        updateMilestone('merge', 'completed');
        updateMilestone('validation', 'active');
        break;
      case 'complete':
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
          onError?.(data.error);
        }
        break;
    }
  };

  const handleExtractionComplete = (extraction: ExtractedMenu) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setProgress(100);
    setCurrentMessage('AI analysis complete!');
    
    const totalItems = extraction.sections.reduce(
      (sum, section) => sum + section.items.length, 
      0
    );
    setItemsFound(totalItems);
    setSectionsFound(extraction.sections.length);
    
    // Brief celebration before callback
    setTimeout(() => {
      onComplete(extraction);
    }, 1500);
  };

  const updateMilestone = (id: string, status: Milestone['status']) => {
    setMilestones(prev => prev.map(m => 
      m.id === id ? { ...m, status } : m
    ));
  };

  return (
    <div className={cn('w-full max-w-max-w-container-standard mx-auto mx-auto', className)}>
      {/* Main Card */}
      <div className="relative bg-white rounded-3xl shadow-warm-xl overflow-hidden">
        {/* Sparkles Background */}
        {showSparkles && (
          <Sparkles
            className="absolute inset-0 z-0"
            particleColor="var(--spanish-orange)"
            particleDensity={20}
            minSize={0.4}
            maxSize={0.8}
          />
        )}
        
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <CuliLogoLoading size={64} className="mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-eerie-black mb-2">
              AI is analyzing your menu
            </h3>
            <div className="min-h-[24px]">
              <TextGenerateEffect
                key={currentMessage}
                words={currentMessage}
                className="text-cinereous"
                duration={0.3}
              />
            </div>
            {extractionTime > 0 && (
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-cinereous">
                <Clock className="h-3 w-3" />
                <span>{extractionTime}s</span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="mb-8">
            <AnimatedCircularProgressBar
              value={progress}
              max={100}
              min={0}
              gaugePrimaryColor="var(--spanish-orange)"
              gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
              className="mx-auto mb-4"
            />
            
            <div className="flex items-center justify-center gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-eerie-black">{sectionsFound}</p>
                <p className="text-sm text-cinereous">Sections</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-eerie-black">{itemsFound}</p>
                <p className="text-sm text-cinereous">Items Found</p>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl transition-all',
                  milestone.status === 'active' && 'bg-spanish-orange/10',
                  milestone.status === 'completed' && 'bg-green-50'
                )}
              >
                <div className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  milestone.status === 'pending' && 'bg-gray-100 text-gray-400',
                  milestone.status === 'active' && 'bg-spanish-orange text-white animate-pulse',
                  milestone.status === 'completed' && 'bg-green-500 text-white'
                )}>
                  {milestone.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : milestone.status === 'active' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    milestone.icon
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    'font-medium transition-colors',
                    milestone.status === 'completed' && 'text-green-700',
                    milestone.status === 'active' && 'text-spanish-orange'
                  )}>
                    {milestone.label}
                  </p>
                  {milestone.detail && (
                    <p className="text-sm text-cinereous">{milestone.detail}</p>
                  )}
                </div>
                {milestone.status === 'active' && (
                  <SparklesIcon className="h-5 w-5 text-spanish-orange animate-pulse" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}