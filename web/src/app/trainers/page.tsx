import { fetchTrainers } from "@/lib/data";
import TrainerCard from "@/components/TrainerCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trainers | Pokemon Training Center",
  description: "Meet our elite gym leader instructors.",
};

export default async function TrainersPage() {
  const trainers = await fetchTrainers();

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Our Trainers
        </h1>
        <p className="mt-2 text-text-secondary">
          {trainers.length} elite gym leaders ready to train your Pokemon
        </p>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.name} trainer={trainer} />
          ))}
        </div>
      </div>
    </div>
  );
}
