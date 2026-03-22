import Link from "next/link";
import Image from "next/image";
import { fetchLessons, fetchTrainers } from "@/lib/data";
import TypeBadge from "@/components/TypeBadge";

const steps = [
  {
    number: "01",
    title: "Enroll Your Pokemon",
    description: "Tell us your Pokemon's species and nickname to get started.",
  },
  {
    number: "02",
    title: "Browse Lessons",
    description: "Explore 18 specialized training categories led by elite gym leaders.",
  },
  {
    number: "03",
    title: "Book via Chat",
    description: "Our AI assistant handles scheduling, recommendations, and more.",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [lessons, trainers] = await Promise.all([fetchLessons(), fetchTrainers()]);
  const featuredLessons = lessons.slice(0, 6);
  const featuredTrainers = trainers.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-32">
        <div className="crt-overlay absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="font-pixel text-xl leading-relaxed text-neon-cyan sm:text-2xl md:text-3xl">
            Pokemon Training Center
          </h1>
          <p className="mt-6 text-lg text-text-secondary sm:text-xl">
            Where every Pokemon reaches its full potential. Elite trainers.
            Specialized lessons. AI-powered scheduling.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/chat"
              className="inline-flex cursor-pointer items-center rounded-xl bg-accent px-8 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary"
            >
              Start Chatting
            </Link>
            <Link
              href="/lessons"
              className="inline-flex cursor-pointer items-center rounded-xl border border-border-main/50 px-8 py-3.5 font-semibold text-text-primary transition-all duration-200 hover:border-primary/60 hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-primary"
            >
              View Lessons
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border-main/20 bg-bg-secondary/30 px-6 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { value: String(lessons.length), label: "Lesson Types" },
            { value: String(trainers.length), label: "Elite Trainers" },
            { value: "1025+", label: "Pokemon Welcome" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-pixel text-lg text-primary-light sm:text-xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Lessons */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
            Featured Lessons
          </h2>
          <p className="mt-2 text-text-secondary">
            Specialized training for every type
          </p>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredLessons.map((lesson) => (
              <div
                key={lesson.name}
                className="rounded-xl border border-border-main/30 bg-bg-secondary p-5 transition-all duration-200 hover:border-primary/60 hover:shadow-[0_0_15px_rgba(124,58,237,0.15)]"
              >
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  {lesson.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {lesson.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {lesson.allowedTypes.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </div>
                <p className="mt-3 text-xs text-text-secondary">
                  Instructor:{" "}
                  <span className="text-primary-light">{lesson.instructor}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/lessons"
              className="cursor-pointer text-sm font-medium text-primary-light transition-colors hover:text-primary"
            >
              View all {lessons.length}{" "}lessons &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-y border-border-main/20 bg-bg-secondary/20 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-heading text-2xl font-bold text-text-primary sm:text-3xl">
            How It Works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <span className="font-pixel text-xs text-primary-light">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainer Spotlight */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
            Meet Our Trainers
          </h2>
          <p className="mt-2 text-text-secondary">
            Learn from the best gym leaders in the region
          </p>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {featuredTrainers.map((trainer) => (
              <div
                key={trainer.name}
                className="rounded-xl border border-border-main/30 bg-bg-secondary p-5 text-center transition-all duration-200 hover:border-primary/60"
              >
                {trainer.spriteUrl && (
                  <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full bg-bg-card p-1.5">
                    <Image
                      src={trainer.spriteUrl}
                      alt={trainer.name}
                      width={64}
                      height={64}
                      className="pixelated h-full w-full object-contain"
                    />
                  </div>
                )}
                <h3 className="font-heading text-sm font-bold text-text-primary">
                  {trainer.name}
                </h3>
                <p className="mt-1 text-xs text-text-secondary">
                  {trainer.specialties[0]}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/trainers"
              className="cursor-pointer text-sm font-medium text-primary-light transition-colors hover:text-primary"
            >
              Meet all {trainers.length}{" "}trainers &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
