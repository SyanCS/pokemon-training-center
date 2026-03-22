export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  intent: { intent: string; [key: string]: unknown } | null;
  data: ChatData | null;
}

// --- Chat data shapes by intent ---

export interface PokemonEnrollmentData {
  species: string;
  nickname: string;
  spriteUrl: string | null;
  types: string;
}

export interface SingleLessonData {
  category: {
    id: number;
    name: string;
    description: string;
    allowedTypes: string;
  };
  instructor: { name: string; spriteUrl: string | null } | null;
  sessions: { datetime: string; spotsLeft: number }[];
}

export interface LessonCategoryItem {
  name: string;
  description: string;
  allowedTypes: string;
  instructor: { name: string; spriteUrl: string | null } | null;
  sessionCount: number;
}

export interface AllLessonsData {
  categories: LessonCategoryItem[];
}

export interface ScheduleLesson {
  lessonName: string;
  datetime: string;
  instructor: { name: string; spriteUrl: string | null };
}

export interface ScheduleData {
  pokemon: {
    nickname: string;
    species: string;
    spriteUrl: string | null;
    types: string;
  };
  lessons: ScheduleLesson[];
}

export interface RecommendationData {
  pokemon: {
    name: string;
    types: string;
    spriteUrl: string | null;
  };
  recommendations: LessonCategoryItem[];
}

export type ChatData =
  | PokemonEnrollmentData
  | SingleLessonData
  | AllLessonsData
  | ScheduleData
  | RecommendationData;

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  data?: ChatData | null;
}
