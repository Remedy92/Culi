
export interface ExtractionUpdate {
  type: 'thinking' | 'section_found' | 'item_found' | 'progress' | 'complete' | 'error';
  content?: unknown;
  progress?: number;
  message?: string;
}

interface Section {
  name: string;
  confidence: number;
  items: Item[];
}

interface Item {
  name: string;
  price: number;
  description?: string;
  confidence: number;
}

export class MenuExtractionParser {
  private buffer: string = '';
  private currentSection: Section | null = null;
  private sections: Section[] = [];
  private items: Item[] = [];
  private itemCount: number = 0;
  private sectionCount: number = 0;
  
  constructor(
    private onUpdate: (update: ExtractionUpdate) => void,
    private onComplete: (result: unknown) => void
  ) {}

  processChunk(chunk: string): void {
    this.buffer += chunk;
    
    // Try to parse complete lines
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || ''; // Keep incomplete line in buffer
    
    for (const line of lines) {
      this.processLine(line.trim());
    }
  }

  private processLine(line: string): void {
    if (!line) return;
    
    // Parse different types of streaming updates
    if (line.startsWith('THINKING:')) {
      this.onUpdate({
        type: 'thinking',
        message: line.substring(9).trim()
      });
    } else if (line.startsWith('SECTION:')) {
      const parts = line.substring(8).split('|');
      const sectionName = parts[0]?.trim();
      const confidence = parseInt(parts[1]?.trim() || '0');
      
      this.sectionCount++;
      this.currentSection = {
        name: sectionName,
        confidence,
        items: []
      };
      this.sections.push(this.currentSection);
      
      this.onUpdate({
        type: 'section_found',
        content: { name: sectionName, confidence },
        progress: this.calculateProgress()
      });
    } else if (line.startsWith('ITEM:')) {
      const parts = line.substring(5).split('|');
      const item = {
        name: parts[0]?.trim(),
        price: parseFloat(parts[1]?.trim() || '0'),
        description: parts[2]?.trim(),
        confidence: parseInt(parts[3]?.trim() || '0')
      };
      
      this.itemCount++;
      this.items.push(item);
      
      if (this.currentSection) {
        this.currentSection.items.push(item);
      }
      
      this.onUpdate({
        type: 'item_found',
        content: item,
        progress: this.calculateProgress()
      });
    } else if (line.startsWith('PROGRESS:')) {
      const progress = parseInt(line.substring(9).trim() || '0');
      this.onUpdate({
        type: 'progress',
        progress,
        message: `Processing menu... ${this.itemCount} items found`
      });
    } else if (line.startsWith('COMPLETE:')) {
      try {
        const jsonStart = line.indexOf('{');
        if (jsonStart !== -1) {
          const jsonStr = line.substring(jsonStart);
          const result = JSON.parse(jsonStr);
          this.onComplete(result);
        }
      } catch (error) {
        console.error('Failed to parse completion JSON:', error);
      }
    } else if (line.startsWith('ERROR:')) {
      this.onUpdate({
        type: 'error',
        message: line.substring(6).trim()
      });
    }
  }

  calculateProgress(): number {
    // Estimate progress based on sections and items found
    const baseProgress = 10; // Initial processing
    const sectionProgress = Math.min(this.sectionCount * 10, 30); // Up to 30% for sections
    const itemProgress = Math.min(this.itemCount * 2, 50); // Up to 50% for items
    
    return Math.min(baseProgress + sectionProgress + itemProgress, 90); // Cap at 90% until complete
  }

  flush(): void {
    // Process any remaining buffer content
    if (this.buffer.trim()) {
      this.processLine(this.buffer.trim());
      this.buffer = '';
    }
  }
}

// Helper to convert structured extraction to streaming format
export function createStreamingExtraction(onChunk: (chunk: string) => void) {
  return {
    thinking: (message: string) => {
      onChunk(`THINKING: ${message}\n`);
    },
    
    foundSection: (name: string, confidence: number) => {
      onChunk(`SECTION: ${name}|${confidence}\n`);
    },
    
    foundItem: (item: { name: string; price: number; description?: string; confidence: number }) => {
      onChunk(`ITEM: ${item.name}|${item.price}|${item.description || ''}|${item.confidence}\n`);
    },
    
    progress: (percent: number) => {
      onChunk(`PROGRESS: ${percent}\n`);
    },
    
    complete: (result: unknown) => {
      onChunk(`COMPLETE: ${JSON.stringify(result)}\n`);
    },
    
    error: (message: string) => {
      onChunk(`ERROR: ${message}\n`);
    }
  };
}