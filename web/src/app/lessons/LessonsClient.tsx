"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LessonCategory } from "@/lib/data";
import { typeNames } from "@/lib/pokemon-types";
import LessonCard from "@/components/LessonCard";
import TypeBadge from "@/components/TypeBadge";

interface Props {
  lessons: LessonCategory[];
}

export default function LessonsClient({ lessons }: Props) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const router = useRouter();

  const filtered = activeType
    ? lessons.filter((l) => l.allowedTypes.includes(activeType))
    : lessons;

  const handleBook = (lessonName: string) => {
    router.push(
      `/chat?message=${encodeURIComponent(`I'd like to book ${lessonName}`)}`
    );
  };

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Lesson Catalog
        </h1>
        <p className="mt-2 text-text-secondary">
          {lessons.length} specialized training categories across every Pokemon
          type
        </p>

        {/* Type filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          <TypeBadge
            type="all"
            size="md"
            active={activeType === null}
            onClick={() => setActiveType(null)}
          />
          {typeNames.map((t) => (
            <TypeBadge
              key={t}
              type={t}
              size="md"
              active={activeType === t}
              onClick={() => setActiveType(activeType === t ? null : t)}
            />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lesson) => (
            <LessonCard key={lesson.name} lesson={lesson} onBook={handleBook} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-text-secondary">
            No lessons found for this type.
          </p>
        )}
      </div>
    </div>
  );
}
