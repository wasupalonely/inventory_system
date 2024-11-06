export interface Confidence {
  confidence: number;
  label: string;
}

export type Label = 'Spoiled' | 'Fresh' | 'Half-fresh';

export interface PredictionResponse {
  label: Label;
  confidences: Confidence[];
}
