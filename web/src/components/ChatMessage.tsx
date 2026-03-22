import {
  Message,
  PokemonEnrollmentData,
  SingleLessonData,
  AllLessonsData,
  ScheduleData,
  RecommendationData,
  ChatData,
} from "@/lib/types";
import TypeBadge from "./TypeBadge";

interface ChatMessageProps {
  message: Message;
}

function isEnrollment(data: ChatData): data is PokemonEnrollmentData {
  return "species" in data && "spriteUrl" in data && !("pokemon" in data);
}

function isSingleLesson(data: ChatData): data is SingleLessonData {
  return "category" in data && "instructor" in data && "sessions" in data;
}

function isAllLessons(data: ChatData): data is AllLessonsData {
  return "categories" in data && Array.isArray((data as AllLessonsData).categories);
}

function isRecommendation(data: ChatData): data is RecommendationData {
  return "pokemon" in data && "recommendations" in data;
}

function isSchedule(data: ChatData): data is ScheduleData {
  return "pokemon" in data && "lessons" in data;
}

function PokemonBanner({ data }: { data: PokemonEnrollmentData }) {
  const types = data.types.split(",").map((t) => t.trim());
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-border-main/30 bg-bg-primary/50 p-3">
      {data.spriteUrl && (
        <img
          src={data.spriteUrl}
          alt={data.species}
          className="h-16 w-16"
          style={{ imageRendering: "pixelated" }}
        />
      )}
      <div>
        <p className="font-bold text-text-primary">{data.nickname || data.species}</p>
        <p className="text-xs capitalize text-text-secondary">{data.species}</p>
        <div className="mt-1 flex gap-1">
          {types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

function InstructorBanner({ data }: { data: SingleLessonData }) {
  const types = data.category.allowedTypes.split(",").map((t) => t.trim());
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-border-main/30 bg-bg-primary/50 p-3">
      {data.instructor?.spriteUrl && (
        <img
          src={data.instructor.spriteUrl}
          alt={data.instructor.name}
          className="h-16 w-16"
          style={{ imageRendering: "pixelated" }}
        />
      )}
      <div className="min-w-0">
        <p className="font-bold text-text-primary">{data.instructor?.name ?? "TBA"}</p>
        <p className="text-xs text-text-secondary">{data.category.description}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
        {data.sessions.length > 0 && (
          <p className="mt-1 text-xs text-text-secondary">
            {data.sessions.length} session(s) available
          </p>
        )}
      </div>
    </div>
  );
}

function LessonCard({ lesson }: { lesson: AllLessonsData["categories"][0] }) {
  const types = lesson.allowedTypes.split(",").map((t) => t.trim());
  return (
    <div className="flex flex-col rounded-xl border border-border-main/30 bg-bg-primary/50 p-3">
      <div className="flex items-center gap-2">
        {lesson.instructor?.spriteUrl && (
          <img
            src={lesson.instructor.spriteUrl}
            alt={lesson.instructor.name}
            className="h-10 w-10"
            style={{ imageRendering: "pixelated" }}
          />
        )}
        <div className="min-w-0">
          <p className="text-xs font-bold text-accent">{lesson.name}</p>
          <p className="text-[10px] text-text-secondary">
            {lesson.instructor?.name ?? "TBA"}
          </p>
        </div>
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-text-secondary">
        {lesson.description}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
    </div>
  );
}

function LessonCardsGrid({ data }: { data: AllLessonsData }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {data.categories.map((c) => (
        <LessonCard key={c.name} lesson={c} />
      ))}
    </div>
  );
}

function ScheduleView({ data }: { data: ScheduleData }) {
  const types = data.pokemon.types.split(",").map((t) => t.trim());
  return (
    <div className="mt-3">
      {/* Pokemon banner */}
      <div className="flex items-center gap-3 rounded-xl border border-border-main/30 bg-bg-primary/50 p-3">
        {data.pokemon.spriteUrl && (
          <img
            src={data.pokemon.spriteUrl}
            alt={data.pokemon.species}
            className="h-16 w-16"
            style={{ imageRendering: "pixelated" }}
          />
        )}
        <div>
          <p className="font-bold text-text-primary">{data.pokemon.nickname}</p>
          <p className="text-xs capitalize text-text-secondary">{data.pokemon.species}</p>
          <div className="mt-1 flex gap-1">
            {types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>
      </div>

      {/* Scheduled lessons */}
      {data.lessons.length > 0 && (
        <div className="mt-2 space-y-2">
          {data.lessons.map((l, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl border border-border-main/30 bg-bg-primary/50 p-3"
            >
              {l.instructor.spriteUrl && (
                <img
                  src={l.instructor.spriteUrl}
                  alt={l.instructor.name}
                  className="h-10 w-10"
                  style={{ imageRendering: "pixelated" }}
                />
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-accent">{l.lessonName}</p>
                <p className="text-[10px] text-text-secondary">{l.instructor.name}</p>
                <p className="text-[10px] text-text-secondary">
                  {new Date(l.datetime).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecommendationView({ data }: { data: RecommendationData }) {
  const types = data.pokemon.types.split(",").map((t) => t.trim());
  return (
    <div className="mt-3">
      <div className="flex items-center gap-3 rounded-xl border border-border-main/30 bg-bg-primary/50 p-3">
        {data.pokemon.spriteUrl && (
          <img
            src={data.pokemon.spriteUrl}
            alt={data.pokemon.name}
            className="h-16 w-16"
            style={{ imageRendering: "pixelated" }}
          />
        )}
        <div>
          <p className="font-bold capitalize text-text-primary">{data.pokemon.name}</p>
          <div className="mt-1 flex gap-1">
            {types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>
      </div>
      {data.recommendations.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {data.recommendations.map((c) => (
            <LessonCard key={c.name} lesson={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChatDataRenderer({ data }: { data: ChatData }) {
  if (isRecommendation(data)) return <RecommendationView data={data} />;
  if (isSchedule(data)) return <ScheduleView data={data} />;
  if (isEnrollment(data)) return <PokemonBanner data={data} />;
  if (isSingleLesson(data)) return <InstructorBanner data={data} />;
  if (isAllLessons(data)) return <LessonCardsGrid data={data} />;
  return null;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-primary text-white"
            : "rounded-bl-sm border border-border-main/30 bg-bg-secondary text-text-primary"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.data && <ChatDataRenderer data={message.data} />}
        {message.intent && (
          <span className="mt-2 inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">
            {message.intent.replace(/_/g, " ")}
          </span>
        )}
      </div>
    </div>
  );
}
