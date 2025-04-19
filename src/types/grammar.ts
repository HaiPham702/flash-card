export interface GrammarExample {
  text: string
  translation: string
  explanation?: string
}

export interface GrammarDay {
  id: number
  title: string
  topics: string[]
  level: 'basic' | 'intermediate' | 'advanced' | 'review'
  explanation?: string
  examples: GrammarExample[]
}

export interface GrammarTopic {
  id: string
  title: string
  description: string
  content?: string
  relatedTopics?: string[]
}

export interface GrammarSearchResult {
  id: string
  title: string
  description: string
  type: 'day' | 'topic'
}

export interface PracticeQuestion {
  id: string
  type: 'multiple-choice' | 'fill-blanks' | 'error-correction' | 'sentence-transformation'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  relatedTopic: string
}

export interface PracticeExercise {
  id: string
  title: string
  description: string
  questions: PracticeQuestion[]
  relatedDay?: number
  relatedTopic?: string
} 