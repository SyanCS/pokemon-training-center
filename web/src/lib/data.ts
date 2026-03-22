const API_BASE = process.env.API_URL || "http://localhost:3000";

export interface Trainer {
  name: string;
  spriteUrl: string | null;
  specialties: string[];
}

export interface LessonCategory {
  name: string;
  description: string;
  allowedTypes: string[];
  instructor: string;
}

export async function fetchTrainers(): Promise<Trainer[]> {
  const res = await fetch(`${API_BASE}/trainers`);
  if (!res.ok) throw new Error("Failed to fetch trainers");
  return res.json();
}

export async function fetchLessons(): Promise<LessonCategory[]> {
  const res = await fetch(`${API_BASE}/lessons`);
  if (!res.ok) throw new Error("Failed to fetch lessons");
  return res.json();
}
