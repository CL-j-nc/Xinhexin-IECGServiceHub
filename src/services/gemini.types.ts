export interface GeminiTextPart {
  text?: string;
}

export interface GeminiContent {
  parts?: GeminiTextPart[];
}

export interface GeminiCandidate {
  content?: GeminiContent;
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[];
}
