import { typeColors } from "@/lib/pokemon-types";

interface TypeBadgeProps {
  type: string;
  size?: "sm" | "md";
  onClick?: () => void;
  active?: boolean;
}

export default function TypeBadge({
  type,
  size = "sm",
  onClick,
  active = true,
}: TypeBadgeProps) {
  const color = typeColors[type] ?? "#888";
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={`inline-block rounded-full font-semibold capitalize transition-all duration-200 ${sizeClasses} ${
        onClick ? "cursor-pointer hover:scale-105" : ""
      } ${active ? "opacity-100" : "opacity-40"}`}
      style={{
        backgroundColor: `${color}22`,
        color: color,
        border: `1px solid ${color}55`,
      }}
    >
      {type}
    </span>
  );
}
