export type SyncStatus = 'Pending' | 'Uploading' | 'Synced' | 'Failed';

export interface WeightMeasurement {
  id: string;
  weight: number;
  ocrRawText: string;
  ocrConfidence: number;
  capturedImagePath: string;
  timestamp: string;
  syncStatus: SyncStatus;
  retryCount: number;
  errorMessage?: string;
}

export type ConfidenceCategory = 'ACCEPT' | 'CONFIRM' | 'RETAKE';

export interface OCRResult {
  rawText: string;
  detectedWeight: number | null;
  confidence: number;
  category: ConfidenceCategory;
  processingTimeMs: number;
  boundingFrame?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  weight: number | null;
  confidence: number;
  category: ConfidenceCategory;
  message: string;
}

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export interface SyncResult {
  totalPending: number;
  successCount: number;
  failedCount: number;
  syncedIds: string[];
}

export type NavigationScreen = 
  | 'WeightHome'
  | 'Camera'
  | 'OCRProcessing'
  | 'OCRResult'
  | 'PendingUpload';

export interface RootStackParamList {
  WeightHome: undefined;
  Camera: undefined;
  OCRProcessing: { imagePath?: string };
  OCRResult: {
    measurement: Partial<WeightMeasurement>;
    ocrResult: OCRResult;
  };
  PendingUpload: undefined;
}
