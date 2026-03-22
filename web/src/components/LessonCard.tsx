import { LessonCategory } from "@/lib/data";
import TypeBadge from "./TypeBadge";

interface LessonCardProps {
  lesson: LessonCategory;
  onBook?: (lessonName: string) => void;
}

export default function LessonCard({ lesson, onBook }: LessonCardProps) {
  return (
    <div className="flex flex-col rounded-xl bg-bg-secondary border border-border-main/30 p-5 transition-all duration-200 hover:border-primary/60 hover:shadow-[0_0_15px_rgba(124,58,237,0.15)]">
      <h3 className="font-heading text-lg font-bold text-text-primary">
        {lesson.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
        {lesson.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {lesson.allowedTypes.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
      <p className="mt-3 text-xs text-text-secondary">
        Instructor: <span className="text-primary-light">{lesson.instructor}</span>
      </p>
      {onBook && (
        <button
          onClick={() => onBook(lesson.name)}
          className="mt-4 cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary"
        >
          Book Now
        </button>
      )}
    </div>
  );
}
