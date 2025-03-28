import { apiRequest } from './index'

export interface AIResponse {
    response: string;
}

export async function generateSuggestions(prompt: string): Promise<AIResponse> {
    return apiRequest('/ai/generate', 'POST', { prompt })
} 