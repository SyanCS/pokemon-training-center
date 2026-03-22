import Image from "next/image";
import { Trainer } from "@/lib/data";

interface TrainerCardProps {
  trainer: Trainer;
}

export default function TrainerCard({ trainer }: TrainerCardProps) {
  return (
    <div className="group relative rounded-xl bg-bg-secondary border border-border-main/30 p-6 text-center transition-all duration-200 hover:border-primary/60 hover:shadow-[0_0_15px_rgba(124,58,237,0.15)]">
      {trainer.spriteUrl && (
        <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full bg-bg-card p-2">
          <Image
            src={trainer.spriteUrl}
            alt={trainer.name}
            width={80}
            height={80}
            className="pixelated h-full w-full object-contain"
          />
        </div>
      )}
      <h3 className="font-heading text-lg font-bold text-text-primary">
        {trainer.name}
      </h3>
      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {trainer.specialties.map((s) => (
          <span
            key={s}
            className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary-light"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
