export interface GradingRequest {
  userResponse: string;
  questionType: string;
  prompt: string;
}

export interface GradingResponse {
  fluency: number;
  lexical: number;
  grammar: number;
  task: number;
  feedback: string;
}

export interface ModelConfig {
  name: string;
  provider: string;
  gatewayId: string;
}

export interface GradingMetrics {
  timeToFirstToken: number;
  totalGenerationTime: number;
  tokenCount: number;
}

export interface LLMResponse {
  modelName: string;
  provider: string;
  response: string;
  metrics: GradingMetrics;
}
