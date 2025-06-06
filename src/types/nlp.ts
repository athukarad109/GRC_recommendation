import { Control } from './controls';

export interface NLPRequest {
  controls: Control[];
}

export interface NLPResponse {
  processedControls: Control[];
  similarityScores?: {
    [key: string]: number;
  };
  mergedControls?: {
    [key: string]: string[];
  };
}

export interface NLPProcessingOptions {
  similarityThreshold: number;
  mergeStrategy: 'strict' | 'lenient';
  preserveFrameworks: boolean;
} 