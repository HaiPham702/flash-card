import { apiRequest } from './index';

type CriterionScore = {
  band: number;
  feedback: string;
};

export interface WritingSubmission {
  _id: string;
  userId: string;
  taskType: 'task1' | 'task2';
  question: string;
  essay: string;
  wordCount: number;
  aiScore: {
    taskAchievement: CriterionScore;
    coherenceAndCohesion: CriterionScore;
    lexicalResource: CriterionScore;
    grammaticalRangeAndAccuracy: CriterionScore;
    overallBand: number;
  };
  detailedFeedback: string;
  submittedAt: string;
}

export interface WritingSubmitRequest {
  userId: string;
  taskType: 'task1' | 'task2';
  question: string;
  essay: string;
}

export const writingApi = {
  // Get all submissions for a user
  getUserSubmissions: (userId: string): Promise<WritingSubmission[]> => 
    apiRequest(`/writing/submissions/${userId}`),

  // Get a specific submission
  getSubmission: (submissionId: string): Promise<WritingSubmission> => 
    apiRequest(`/writing/submission/${submissionId}`),

  // Submit a new essay for evaluation
  submitEssay: (data: WritingSubmitRequest): Promise<WritingSubmission> => 
    apiRequest('/writing/submit', 'POST', data)
}; 