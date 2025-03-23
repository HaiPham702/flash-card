import { apiRequest } from './index'

export async function generateSuggestions(prompt: string): Promise<string[]> {
    return apiRequest('/ai/generate', 'POST', { prompt })
} 