import { ModelConfig } from '@/types/grading';

export const modelConfig: Record<string, ModelConfig> = {
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'OpenAI',
    gatewayId: 'openai/gpt-4o'
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    gatewayId: 'openai/gpt-4o-mini'
  },
  'claude-3-5-sonnet-20241022': {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    gatewayId: 'anthropic/claude-3-5-sonnet-20241022'
  },
  'claude-3-haiku-20240307': {
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    gatewayId: 'anthropic/claude-3-haiku-20240307'
  }
};

// Default model for grading
export const defaultGradingModel = 'claude-3-5-sonnet-20241022';
