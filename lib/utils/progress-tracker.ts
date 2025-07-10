/**
 * Progress tracking utilities for menu extraction
 * Provides timed messages and progress updates during long-running operations
 */

export interface ProgressUpdate {
  stage: string;
  progress: number;
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class ProgressTracker {
  private startTime: number;
  private updates: ProgressUpdate[] = [];
  private intervalId?: NodeJS.Timeout;
  
  constructor(private onUpdate?: (update: ProgressUpdate) => void) {
    this.startTime = Date.now();
  }
  
  /**
   * Send a progress update
   */
  sendUpdate(stage: string, progress: number, message: string, metadata?: Record<string, unknown>) {
    const update: ProgressUpdate = {
      stage,
      progress,
      message,
      timestamp: Date.now() - this.startTime,
      metadata
    };
    
    this.updates.push(update);
    this.onUpdate?.(update);
    
    console.log(`[Progress ${progress}%] ${stage}: ${message}`);
  }
  
  /**
   * Start timed progress messages
   */
  startTimedMessages(messages: Array<{ delay: number; stage: string; progress: number; message: string }>) {
    let lastIndex = -1;
    
    this.intervalId = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      
      // Find the appropriate message for current time
      const currentIndex = messages.findIndex(m => elapsed >= m.delay && elapsed < m.delay + 3000);
      
      if (currentIndex !== -1 && currentIndex !== lastIndex) {
        const msg = messages[currentIndex];
        this.sendUpdate(msg.stage, msg.progress, msg.message);
        lastIndex = currentIndex;
      }
    }, 500);
  }
  
  /**
   * Stop timed messages
   */
  stopTimedMessages() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
  
  /**
   * Get elapsed time
   */
  getElapsed(): number {
    return Date.now() - this.startTime;
  }
  
  /**
   * Get all updates
   */
  getUpdates(): ProgressUpdate[] {
    return this.updates;
  }
}

/**
 * Progress messages for different extraction stages
 */
export const EXTRACTION_PROGRESS_MESSAGES = {
  ocr: [
    { delay: 0, stage: 'ocr_start', progress: 10, message: 'Scanning menu structure...' },
    { delay: 1000, stage: 'ocr_processing', progress: 15, message: 'Detecting text regions...' },
    { delay: 2000, stage: 'ocr_processing', progress: 20, message: 'Extracting menu content...' }
  ],
  
  ai: [
    { delay: 0, stage: 'ai_start', progress: 25, message: 'Preparing AI analysis...' },
    { delay: 3000, stage: 'ai_processing', progress: 35, message: 'Detecting menu sections...' },
    { delay: 6000, stage: 'ai_processing', progress: 45, message: 'Identifying dishes and prices...' },
    { delay: 9000, stage: 'ai_processing', progress: 55, message: 'Analyzing dietary information...' },
    { delay: 12000, stage: 'ai_processing', progress: 65, message: 'Extracting allergen details...' },
    { delay: 15000, stage: 'ai_processing', progress: 70, message: 'Finalizing menu structure...' },
    { delay: 20000, stage: 'ai_processing', progress: 75, message: 'Processing complex items...' },
    { delay: 25000, stage: 'ai_processing', progress: 78, message: 'Almost there, finishing up...' }
  ],
  
  merge: [
    { delay: 0, stage: 'merge_start', progress: 80, message: 'Combining OCR and AI results...' },
    { delay: 1000, stage: 'merge_processing', progress: 85, message: 'Validating extracted items...' },
    { delay: 2000, stage: 'merge_processing', progress: 90, message: 'Organizing menu structure...' }
  ],
  
  save: [
    { delay: 0, stage: 'save_start', progress: 92, message: 'Saving to database...' },
    { delay: 500, stage: 'save_processing', progress: 95, message: 'Caching results...' },
    { delay: 1000, stage: 'save_complete', progress: 100, message: 'Extraction complete!' }
  ]
};

/**
 * Timeout configurations with actions
 */
export const EXTRACTION_TIMEOUTS = [
  {
    after: 15000,
    stage: 'warning',
    message: 'This is taking longer than usual. Large or complex menus may need extra time...'
  },
  {
    after: 30000,
    stage: 'offer_alternative',
    message: 'Still processing. You can continue waiting or try with different settings.'
  },
  {
    after: 45000,
    stage: 'timeout_warning',
    message: 'Processing is taking unusually long. Consider using a clearer image if available.'
  }
];