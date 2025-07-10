'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Leaf,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExtractedMenu, MenuItem } from '@/lib/ai/menu/extraction-schemas';

interface MenuExtractionResultsProps {
  extraction: ExtractedMenu;
  className?: string;
}

export function MenuExtractionResults({ extraction, className }: MenuExtractionResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(extraction.sections.map(s => s.id))
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircle2 className="h-4 w-4" />;
    if (confidence >= 70) return <AlertCircle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Summary Card */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold">Extraction Summary</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Sections</p>
            <p className="text-2xl font-semibold">{extraction.sections.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Items</p>
            <p className="text-2xl font-semibold">{extraction.items.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Overall Confidence</p>
            <div className="flex items-center gap-2">
              <p className={cn('text-2xl font-semibold', getConfidenceColor(extraction.overallConfidence))}>
                {extraction.overallConfidence}%
              </p>
              {getConfidenceIcon(extraction.overallConfidence)}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Language</p>
            <p className="text-2xl font-semibold">{extraction.metadata.language.toUpperCase()}</p>
          </div>
        </div>
        
        {extraction.metadata.warnings && extraction.metadata.warnings.length > 0 && (
          <div className="mt-4 rounded-md bg-yellow-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Warnings:</p>
                <ul className="mt-1 space-y-1 text-yellow-700">
                  {extraction.metadata.warnings.map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menu Sections */}
      <div className="space-y-4">
        {extraction.sections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border bg-card overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
                <h4 className="text-lg font-semibold">{section.name}</h4>
                <span className="text-sm text-muted-foreground">
                  ({section.items.length} items)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-medium', getConfidenceColor(section.confidence))}>
                  {section.confidence}% confidence
                </span>
                {getConfidenceIcon(section.confidence)}
              </div>
            </button>

            {/* Section Items */}
            <AnimatePresence>
              {expandedSections.has(section.id) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 space-y-3">
                    {section.items.map((item) => (
                      <MenuItemDisplay key={item.id} item={item} currency={extraction.metadata.currency} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Raw OCR Text (Collapsible) */}
      {extraction.rawOcrText && (
        <details className="rounded-lg border bg-muted/30 p-4">
          <summary className="cursor-pointer font-medium">Raw OCR Text</summary>
          <pre className="mt-4 text-xs overflow-x-auto whitespace-pre-wrap">
            {extraction.rawOcrText}
          </pre>
        </details>
      )}
    </div>
  );
}

function MenuItemDisplay({ item, currency }: { item: MenuItem; currency?: string }) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'Market Price';
    if (price === 0) return 'Free';
    return `${currency || '€'}${price.toFixed(2)}`;
  };

  return (
    <div className="rounded-md border bg-background p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h5 className="font-medium">{item.name}</h5>
            <span className={cn('text-xs', getConfidenceColor(item.confidence))}>
              {item.confidence}%
            </span>
          </div>
          
          {item.description && (
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          )}
          
          <div className="mt-2 flex flex-wrap gap-2">
            {item.allergens && item.allergens.length > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <span className="text-xs text-orange-600">
                  {item.allergens.join(', ')}
                </span>
              </div>
            )}
            
            {item.dietaryTags && item.dietaryTags.length > 0 && (
              <div className="flex items-center gap-1">
                <Leaf className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">
                  {item.dietaryTags.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-semibold text-lg">{formatPrice(item.price)}</p>
          {item.modifiers && item.modifiers.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              + {item.modifiers.length} options
            </p>
          )}
        </div>
      </div>
    </div>
  );
}