export interface SpeakingTopic {
  _id: string;
  date: string;
  part1: {
    questions: string[];
  };
  part2: {
    topic: string;
    followUpQuestions: string[];
  };
  part3: {
    questions: string[];
  };
  createdAt: string;
  updatedAt: string;
} 